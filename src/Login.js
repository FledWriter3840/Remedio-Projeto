import { useState } from "react";
import "./App.css";

function Login({ setToken }) {
  const [dados, setDados] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const data = await res.json();

      // RNF-03 / RF-07: Token JWT + dados do usuário retornados pelo backend
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setToken(data.token);
      } else {
        setErro(data.message || "Erro no login");
      }
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">⚕</span>
          <h1 className="login-title">FarmaSystem</h1>
          <p className="login-sub">Gestão inteligente de estoque</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group">
            <label className="field-label">E-mail</label>
            <input
              className="field-input"
              type="email"
              placeholder="seu@email.com"
              value={dados.email}
              required
              onChange={(e) => setDados({ ...dados, email: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Senha</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={dados.senha}
              required
              onChange={(e) => setDados({ ...dados, senha: e.target.value })}
            />
          </div>

          {erro && <div className="login-erro">{erro}</div>}

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          Acesso restrito · Conforme LGPD
        </p>
      </div>
    </div>
  );
}

export default Login;