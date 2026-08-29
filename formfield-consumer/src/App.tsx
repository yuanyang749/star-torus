import { MyFormField } from '@/components/formfield/MyFormField'
import './App.css'

function App() {
  return (
    <main className="consumer-shell">
      <header className="install-status">
        <p>LOCAL CONSUMER / CLI VERIFIED</p>
        <h1>MyFormField</h1>
        <span><i aria-hidden="true" />已从本地 Registry 安装</span>
      </header>

      <section className="field-preview" aria-label="MyFormField 组件预览">
        <MyFormField />
      </section>
    </main>
  )
}

export default App
