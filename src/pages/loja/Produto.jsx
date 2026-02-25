import { useParams, useNavigate } from 'react-router-dom';
import mock from '../../data/mock';
import styles from './Produto.module.css';

export default function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const produto = mock.produtos.find(p => String(p.id) === String(id));

  if (!produto) return <div className={styles.notFound}>Produto não encontrado.</div>;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>Voltar</button>
      <div className={styles.produtoWrap}>
        <img src={produto.foto} alt={produto.nome} className={styles.produtoImg} />
        <div className={styles.produtoInfo}>
          <h1 className={styles.produtoNome}>{produto.nome}</h1>
          <div className={styles.produtoCategoria}>{produto.categoria}</div>
          <div className={styles.produtoDesc}>{produto.descricaoLonga || produto.descricao}</div>
          <div className={styles.produtoPreco}>R$ {produto.preco.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>
    </div>
  );
}
