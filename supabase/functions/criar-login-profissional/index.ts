import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DOMINIO_EMAIL = "@enfermagem.passagemplantao.com";
const PREFIXO_EXIBICAO: Record<string, string> = { medico: "DR.", farmaceutico: "FARM.", enfermagem: "ENF.", recepcao: "REC." };
const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

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
  const { data: ehAdmin, error: erroAdmin } = await clienteChamador.rpc("is_admin");
  if (erroAdmin || !ehAdmin) return json({ error: "Só a direção pode criar login de profissional" }, 403);

  const body = await req.json().catch(() => ({}));
  const nome = (body.nome ?? "").trim();
  const username = (body.username ?? "").trim().toLowerCase().replace(/\s+/g, ".");
  const tipo = body.tipo;
  const registro = String(body.registro ?? body.crm ?? "").trim() || null;
  const uf = UFS.includes(body.conselho_uf) ? body.conselho_uf : "PA";
  const exibicaoInformada = String(body.nome_exibicao ?? "").trim().toUpperCase().slice(0, 60);
  if (!nome || !username || !["medico", "enfermagem", "recepcao"].includes(tipo)) {
    return json({ error: "nome, username e tipo (medico|enfermagem|recepcao) são obrigatórios" }, 400);
  }

  const clienteAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  let senha = "";
  let criado: { user: { id: string } | null } | null = null;
  let erroCriar: { message: string } | null = null;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    senha = senhaProvisoria();
    const r = await clienteAdmin.auth.admin.createUser({ email: username + DOMINIO_EMAIL, password: senha, email_confirm: true });
    criado = r.data as typeof criado; erroCriar = r.error;
    if (!r.error || !/weak|guess|pwned|leak/i.test(r.error.message)) break;
  }
  if (erroCriar || !criado?.user) {
    const msg = /already|registered|exists/i.test(erroCriar?.message ?? "") ? "Esse usuário já existe. Escolha outro." : (erroCriar?.message ?? "Falha ao criar login");
    return json({ error: msg }, 400);
  }

  const nomeExibicao = exibicaoInformada || ((PREFIXO_EXIBICAO[tipo] ?? "") + nome.split(/\s+/)[0].toUpperCase());
  const { error: erroPerfil } = await clienteAdmin.from("enfermeiros").insert({
    id: criado.user.id, nome, nome_exibicao: nomeExibicao, tipo, role: "enfermeiro", deve_trocar_senha: true,
    crm: tipo === "medico" ? registro : null, coren: tipo === "enfermagem" ? registro : null,
    conselho_uf: tipo === "recepcao" ? null : uf,
  });
  if (erroPerfil) {
    await clienteAdmin.auth.admin.deleteUser(criado.user.id);
    return json({ error: erroPerfil.message }, 500);
  }
  return json({ ok: true, id: criado.user.id, username, senha_provisoria: senha });
});
