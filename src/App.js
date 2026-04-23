import { useEffect, useState } from "react";
import Login from "./Login";
import "./App.css";

// ==========================================
// RF-07: Perfis: admin, gestor, usuario
// ==========================================

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || null;
    } catch {
      return null;
    }
  });


  const [aba, setAba] = useState("estoque");

  const [produtos, setProdutos] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [margens, setMargens] = useState([]);
  const [auditoria, setAuditoria] = useState([]);

  const [msg, setMsg] = useState(null); // { tipo: 'ok'|'erro', texto: '' }

  const [pedido, setPedido] = useState({
      cliente_id: "",
      itens: []
    });
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "" });
  const [lote, setLote] = useState({ produto_id: "", numero_lote: "", validade: "", quantidade: "" });
  

const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}` // Adicionado o prefixo Bearer
});

  const notificar = (tipo, texto) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 4000);
  };

  // ==========================================
  // FETCHES
  // ==========================================

  const fetchProdutos = () =>
    fetch("http://localhost:3001/produtos")
      .then(r => r.json()).then(setProdutos).catch(() => {});

  // RF-05: Estoque atualizado em tempo real
  const fetchEstoque = () =>
    fetch("http://localhost:3001/estoque")
      .then(r => r.json()).then(setEstoque).catch(() => {});

  // RF-03: Alertas de validade automáticos
  const fetchAlertas = () =>
    fetch("http://localhost:3001/alertas")
      .then(r => r.json()).then(setAlertas).catch(() => {});

  const fetchClientes = async () => {
      try {
        const r = await fetch("http://localhost:3001/clientes", {
          headers: headers()
        });

        const data = await r.json();

        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          console.error("Erro clientes:", data);
          setClientes([]);
        }

      } catch (err) {
        console.error(err);
        setClientes([]);
      }
    };

  // RN-02: Margem de lucro somente para gestor
  const fetchMargens = async () => {
      try {
        const r = await fetch("http://localhost:3001/margem-lucro", {
          headers: headers()
        });

        const data = await r.json();

        if (Array.isArray(data)) {
          setMargens(data);
        } else {
          console.error("Erro margens:", data);
          setMargens([]);
        }

      } catch (err) {
        console.error(err);
        setMargens([]);
      }
    };

  // RF-08: Auditoria somente para admin
  const fetchAuditoria = () =>
    fetch("http://localhost:3001/auditoria", { headers: headers() })
      .then(r => r.json()).then(setAuditoria).catch(() => {});

 useEffect(() => {
  if (token) {
    const uStr = localStorage.getItem("usuario");

    if (!uStr) {
      console.error("Usuário não encontrado no localStorage");
      logout();
      return;
    }

    try {
      const u = JSON.parse(uStr);
      setUsuario(u);

      fetchProdutos();
      fetchEstoque();
      fetchAlertas();
      fetchClientes();

      if (u?.perfil === "gestor" || u?.perfil === "admin") {
        fetchMargens();
      }

      if (u?.perfil === "admin") {
        fetchAuditoria();
      }

    } catch (e) {
      console.error("Erro ao parsear usuário:", e);
      logout();
    }
  }
}, [token]);

  // ==========================================
  // LOGIN GUARD
  // ==========================================

  // LOGIN GUARD (forma segura)
    if (!token) {
      return (
        <div className="app-shell">
          <Login setToken={setToken} />
        </div>
      );
    }

  // ==========================================
  // RF-01: Cadastro de produto (admin/gestor)
  // ==========================================

  const handleProduto = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/produtos", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      notificar("ok", data.mensagem || "Produto cadastrado!");
      setForm({ nome: "", descricao: "", preco: "" });
      fetchProdutos();
    } else {
      notificar("erro", data.message || "Erro ao cadastrar produto");
    }
  };

  // ==========================================
  // RF-02: Cadastro de lote com validade
  // ==========================================

  const handleLote = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/lotes", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(lote)
    });
    const data = await res.json();
    if (res.ok) {
      notificar("ok", data.mensagem || "Lote cadastrado!");
      setLote({ produto_id: "", numero_lote: "", validade: "", quantidade: "" });
      fetchProdutos();
      fetchEstoque();
      fetchAlertas();
    } else {
      notificar("erro", data.message || "Erro ao cadastrar lote");
    }
  };

  const adicionarItem = () => {
      setPedido({
        ...pedido,
        itens: [...pedido.itens, { produto_id: "", quantidade: 1 }]
      });
    };

const atualizarItem = (index, campo, valor) => {
      const novos = [...pedido.itens];
      novos[index][campo] = valor;
      setPedido({ ...pedido, itens: novos });
    };

  // ==========================================
  // RF-04 / RF-05 / RF-06 / RN-03 / RN-04
  // ==========================================

const handlePedido = async (e) => {
  e.preventDefault();

  // Montamos o objeto exatamente como o backend espera
  const dadosParaEnviar = {
    cliente_id: pedido.cliente_id,
    itens: [
      {
        produto_id: pedido.produto_id,
        quantidade: parseInt(pedido.quantidade)
      }
    ]
  };

  const res = await fetch("http://localhost:3001/pedido-completo", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dadosParaEnviar) // Enviamos a estrutura corrigida
  });

  const data = await res.json();

  if (res.ok) {
    notificar("ok", `✅ Pedido #${data.pedido_id} finalizado! NF #${data.nf_id} emitida.`);
    // Limpa o formulário corretamente
    setPedido({ cliente_id: "", produto_id: "", quantidade: "" });
    fetchEstoque();
    fetchAlertas();
  } else {
    // Se o backend retornar "Pedido inválido", agora saberemos o motivo exato
    notificar("erro", data.message || "Erro ao finalizar pedido");
  }
};

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
  };

  // ==========================================
  // ABAS disponíveis por perfil
  // ==========================================

  const abas = [
    { id: "estoque", label: "📦 Estoque", perfis: ["admin", "gestor", "usuario"] },
    { id: "alertas", label: "🚨 Alertas", perfis: ["admin", "gestor", "usuario"] },
    { id: "pedido", label: "🛒 Pedido", perfis: ["admin", "gestor", "usuario"] },
    { id: "produto", label: "➕ Produto", perfis: ["admin", "gestor"] },
    { id: "lote", label: "📋 Lote", perfis: ["admin", "gestor"] },
    { id: "margens", label: "📊 Margens", perfis: ["gestor", "admin"] },
    { id: "auditoria", label: "🔍 Auditoria", perfis: ["admin"] },
  ].filter(a => a.perfis.includes(usuario?.perfil));

  const perfil = usuario?.perfil;

  return (
    <div className="app-shell">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-icon">⚕</span>
          <span className="topbar-name">RemedioSystem</span>
        </div>
        <div className="topbar-user">
          <span className={`badge-perfil badge-perfil--${perfil}`}>{usuario?.nome}</span>
          <span className="badge-tag">{perfil}</span>
          <button className="btn-logout" onClick={logout}>Sair</button>
        </div>
      </header>

      {/* NOTIFICAÇÃO */}
      {msg && (
        <div className={`toast toast--${msg.tipo}`}>{msg.texto}</div>
      )}

      {/* TABS */}
      <nav className="tabs">
        {abas.map(a => (
          <button
            key={a.id}
            className={`tab-btn ${aba === a.id ? "tab-btn--ativo" : ""}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </nav>

      <main className="conteudo">

        {/* ==================== ESTOQUE — RF-05 ==================== */}
        {aba === "estoque" && (
          <section className="secao">
            <h2 className="secao-titulo">📦 Estoque em Tempo Real</h2>
            <button className="btn-refresh" onClick={fetchEstoque}>↺ Atualizar</button>
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Lote</th>
                    <th>Validade</th>
                    <th>Dias p/ Vencer</th>
                    <th>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((e, i) => (
                    <tr key={i} className={e.dias_para_vencer <= 30 ? "linha-alerta" : ""}>
                      <td>{e.nome}</td>
                      <td><code>{e.numero_lote}</code></td>
                      <td>{e.validade}</td>
                      <td>
                        <span className={`badge-dias ${e.dias_para_vencer <= 30 ? "badge-dias--urgente" : ""}`}>
                          {e.dias_para_vencer}d
                        </span>
                      </td>
                      <td><strong>{e.quantidade}</strong></td>
                    </tr>
                  ))}
                  {estoque.length === 0 && (
                    <tr><td colSpan={5} className="empty">Nenhum item em estoque</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================== ALERTAS — RF-03 / RN-01 ==================== */}
        {aba === "alertas" && (
          <section className="secao">
            <h2 className="secao-titulo">🚨 Alertas de Validade</h2>
            <p className="secao-desc">Produtos vencendo nos próximos 30 dias. Itens vencidos são bloqueados automaticamente (RN-01).</p>
            {alertas.length === 0 ? (
              <div className="empty-card">✅ Nenhum produto próximo ao vencimento</div>
            ) : (
              <div className="cards-grid">
                {alertas.map((a, i) => (
                  <div key={i} className="alerta-card">
                    <div className="alerta-card__header">
                      <strong>{a.produto}</strong>
                      <span className="alerta-card__dias">{a.dias_restantes}d</span>
                    </div>
                    <div className="alerta-card__info">Lote: <code>{a.numero_lote}</code></div>
                    <div className="alerta-card__info">Validade: {a.validade}</div>
                    <div className="alerta-card__info">Quantidade: {a.quantidade}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==================== PEDIDO — RF-04 / RF-06 / RN-03 / RN-04 ==================== */}
        {aba === "pedido" && (
          <section className="secao">
            <h2 className="secao-titulo">🛒 Novo Pedido</h2>
            <p className="secao-desc">
              O pedido só é finalizado se houver estoque disponível (RN-03). 
              A nota fiscal é emitida automaticamente (RF-06 / RN-04).
            </p>
            <form className="form-card" onSubmit={handlePedido}>
              <div className="field-group">
                <label className="field-label">Cliente</label>
                <select
                  className="field-input"
                  value={pedido.cliente_id}
                  required
                  onChange={(e) => setPedido({ ...pedido, cliente_id: e.target.value })}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Produto</label>
                <select
                  className="field-input"
                  value={pedido.produto_id}
                  required
                  onChange={(e) => setPedido({ ...pedido, produto_id: e.target.value })}
                >
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} — R$ {p.preco}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Quantidade</label>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={pedido.quantidade}
                  required
                  onChange={(e) => setPedido({ ...pedido, quantidade: e.target.value })}
                />
              </div>
              <button className="btn-primary" type="submit">
                Finalizar Pedido + Emitir NF
              </button>
            </form>
          </section>
        )}

        {/* ==================== PRODUTO — RF-01 ==================== */}
        {aba === "produto" && (perfil === "admin" || perfil === "gestor") && (
          <section className="secao">
            <h2 className="secao-titulo">➕ Cadastro de Produto</h2>
            <form className="form-card" onSubmit={handleProduto}>
              <div className="field-group">
                <label className="field-label">Nome</label>
                <input
                  className="field-input"
                  placeholder="Ex: Dipirona 500mg"
                  value={form.nome}
                  required
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Descrição</label>
                <input
                  className="field-input"
                  placeholder="Descrição do produto"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Preço (R$)</label>
                <input
                  className="field-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.preco}
                  required
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                />
              </div>
              <button className="btn-primary" type="submit">Cadastrar Produto</button>
            </form>

            <h3 className="secao-subtitulo">Produtos Cadastrados</h3>
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead><tr><th>#</th><th>Nome</th><th>Descrição</th><th>Preço</th></tr></thead>
                <tbody>
                  {produtos.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.id}</code></td>
                      <td><strong>{p.nome}</strong></td>
                      <td>{p.descricao}</td>
                      <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================== LOTE — RF-02 ==================== */}
        {aba === "lote" && (perfil === "admin" || perfil === "gestor") && (
          <section className="secao">
            <h2 className="secao-titulo">📋 Cadastro de Lote</h2>
            <form className="form-card" onSubmit={handleLote}>
              <div className="field-group">
                <label className="field-label">Produto</label>
                <select
                  className="field-input"
                  value={lote.produto_id}
                  required
                  onChange={(e) => setLote({ ...lote, produto_id: e.target.value })}
                >
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Número do Lote</label>
                <input
                  className="field-input"
                  placeholder="Ex: L2024-001"
                  value={lote.numero_lote}
                  required
                  onChange={(e) => setLote({ ...lote, numero_lote: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Data de Validade</label>
                <input
                  className="field-input"
                  type="date"
                  value={lote.validade}
                  required
                  onChange={(e) => setLote({ ...lote, validade: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Quantidade</label>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={lote.quantidade}
                  required
                  onChange={(e) => setLote({ ...lote, quantidade: e.target.value })}
                />
              </div>
              <button className="btn-primary" type="submit">Cadastrar Lote</button>
            </form>
          </section>
        )}

        {/* ==================== MARGENS — RN-02 ==================== */}
        {aba === "margens" && (perfil === "gestor" || perfil === "admin") && (
          <section className="secao">
            <h2 className="secao-titulo">📊 Margem de Lucro</h2>
            <p className="secao-desc">Acesso restrito a gestores (RN-02).</p>
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço Venda</th>
                    <th>Custo Estimado</th>
                    <th>Lucro</th>
                    <th>Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {margens.map((m, i) => (
                    <tr key={i}>
                      <td><strong>{m.produto}</strong></td>
                      <td>R$ {parseFloat(m.preco_venda).toFixed(2)}</td>
                      <td>R$ {parseFloat(m.custo_estimado).toFixed(2)}</td>
                      <td className="lucro">R$ {parseFloat(m.lucro).toFixed(2)}</td>
                      <td><span className="badge-margem">{m.margem_percentual}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================== AUDITORIA — RF-08 / RN-05 ==================== */}
        {aba === "auditoria" && perfil === "admin" && (
          <section className="secao">
            <h2 className="secao-titulo">🔍 Histórico de Auditoria</h2>
            <p className="secao-desc">
              Todas as ações registradas com usuário, data e descrição (RN-05 / RF-08).
            </p>
            <button className="btn-refresh" onClick={fetchAuditoria}>↺ Atualizar</button>
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th>Ação</th>
                    <th>Data / Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((a, i) => (
                    <tr key={i}>
                      <td><code>{a.id}</code></td>
                      <td><strong>{a.usuario}</strong></td>
                      <td><span className="badge-tag">{a.perfil}</span></td>
                      <td>{a.acao}</td>
                      <td className="data-hora">{a.data}</td>
                    </tr>
                  ))}
                  {auditoria.length === 0 && (
                    <tr><td colSpan={5} className="empty">Nenhum registro de auditoria</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;