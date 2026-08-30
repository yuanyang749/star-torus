import { CelestialGyroField } from '@/components/formfield/presets/CelestialGyroField'
import './App.css'

function App() {
  return (
    <main className="consumer-shell">
      <header className="install-status">
        <p>CLOUD CONSUMER / CLI VERIFIED</p>
        <h1>CelestialGyroField</h1>
        <span><i aria-hidden="true" />已从云端 Registry 安装</span>
      </header>

      <section className="field-preview" aria-label="浑天星仪组件预览">
        <CelestialGyroField />
      </section>
    </main>
  )
}

export default App
