import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Senha provisória simples de digitar (minúsculas + números): "upa" + 6 dígitos aleatórios.
// A proteção do Supabase recusa senhas fracas conhecidas (ex.: 123456); se recusar, gera outra.
function senhaProvisoria(): string {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return `upa${String(100000 + (b[0] % 900000))}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const clienteChamador = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: userData, error: erroUser } = await clienteChamador.auth.getUser(token);
  if (erroUser || !userData?.user) return json({ error: "Não autenticado" }, 401);
  const { data: podeResetar, error: erroPerm } = await clienteChamador.rpc("tem_permissao", { p: "resetar_senha" });
  if (erroPerm || !podeResetar) return json({ error: "Você não tem permissão para resetar senhas" }, 403);
  const { data: souAdmin } = await clienteChamador.rpc("is_admin");

  const { profissional_id } = await req.json().catch(() => ({ profissional_id: null }));
  if (!profissional_id) return json({ error: "profissional_id é obrigatório" }, 400);

  const clienteAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: alvo } = await clienteAdmin.from("enfermeiros").select("role").eq("id", profissional_id).maybeSingle();
  if (!alvo) return json({ error: "Profissional não encontrado" }, 404);
  if (alvo.role === "admin" && !souAdmin) return json({ error: "Só o administrador geral pode resetar a senha de outro administrador" }, 403);
  let senha = "";
  let erroSenha: { message: string } | null = null;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    senha = senhaProvisoria();
    const { error } = await clienteAdmin.auth.admin.updateUserById(profissional_id, { password: senha });
    erroSenha = error;
    if (!error || !/weak|guess|pwned|leak/i.test(error.message)) break;
  }
  if (erroSenha) return json({ error: erroSenha.message }, 500);
  const { error: erroFlag } = await clienteAdmin.from("enfermeiros").update({ deve_trocar_senha: true }).eq("id", profissional_id);
  if (erroFlag) return json({ error: erroFlag.message }, 500);
  await clienteAdmin.from("eventos_auditoria").insert({
    autor_id: userData.user.id, acao: "resetar_senha", entidade: "enfermeiros", entidade_id: profissional_id,
  });
  return json({ ok: true, senha_provisoria: senha });
});
