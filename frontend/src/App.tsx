
import './App.css'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: unknown
    }
  }
}

function App() {

  return (
    <main>
      <h1>Controle Financeiro Pessoal</h1>
      <p>Frontend iniciado com sucesso!</p>
    </main>
  )
}

export default App

  
