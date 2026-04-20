import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [produtos, setProdutos] = useState([]);
  
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: ""
  });

  const [lote, setLote] = useState({
    produto_id: "",
    numero_lote: "",
    validade: "",
    quantidade: ""
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Buscar produtos
  const fetchProdutos = () => {
    fetch("http://localhost:3001/produtos")
      .then(res => res.json())
      .then(data => setProdutos(data));
  };

  // Cadastro de produto
  const handleProduto = (e) => {
    e.preventDefault();

    fetch("http://localhost:3001/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
    .then(() => {
      setForm({
        nome: "",
        descricao: "",
        preco: ""
      });

      fetchProdutos();
    });
  };

  // Cadastro de lote
  const handleLote = (e) => {
    e.preventDefault();

    fetch("http://localhost:3001/lotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lote)
    })
    .then(() => {
      setLote({
        produto_id: "",
        numero_lote: "",
        validade: "",
        quantidade: ""
      });

      alert("Lote cadastrado com sucesso!");
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>💊 Sistema de Farmácia</h1>

      <h2>Cadastro de Produto</h2>

      <form onSubmit={handleProduto}>
        <input
          placeholder="Nome"
          value={form.nome}
          onChange={(e) =>
            setForm({ ...form, nome: e.target.value })
          }
        />

        <br /><br />

        <input
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) =>
            setForm({ ...form, descricao: e.target.value })
          }
        />

        <br /><br />

        <input
          placeholder="Preço"
          value={form.preco}
          onChange={(e) =>
            setForm({ ...form, preco: e.target.value })
          }
        />

        <br /><br />

        <button type="submit">
          Cadastrar Produto
        </button>
      </form>

      <hr />

      <h2>Cadastro de Lote</h2>

      <form onSubmit={handleLote}>
        <input
          placeholder="ID do Produto"
          value={lote.produto_id}
          onChange={(e) =>
            setLote({ ...lote, produto_id: e.target.value })
          }
        />

        <br /><br />

        <input
          placeholder="Número do Lote"
          value={lote.numero_lote}
          onChange={(e) =>
            setLote({ ...lote, numero_lote: e.target.value })
          }
        />

        <br /><br />

        <input
          type="date"
          value={lote.validade}
          onChange={(e) =>
            setLote({ ...lote, validade: e.target.value })
          }
        />

        <br /><br />

        <input
          placeholder="Quantidade"
          value={lote.quantidade}
          onChange={(e) =>
            setLote({ ...lote, quantidade: e.target.value })
          }
        />

        <br /><br />

        <button type="submit">
          Cadastrar Lote
        </button>
      </form>

      <hr />

      <h2>Produtos Cadastrados</h2>

      {produtos.map((p) => (
        <div key={p.id}>
          <strong>{p.nome}</strong><br />
          {p.descricao}<br />
          R$ {p.preco}
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;