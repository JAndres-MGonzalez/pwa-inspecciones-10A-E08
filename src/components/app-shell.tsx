export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <a className="app-header__brand" href="/">
            <span className="app-header__mark" aria-hidden="true">
              UTT
            </span>
            <span className="app-header__name">Inspecciones de laboratorio</span>
          </a>

          <nav className="app-nav" aria-label="Navegación principal">
            <a className="app-nav__link app-nav__link--active" href="/" aria-current="page">
              Inicio
            </a>
            <a className="app-nav__link" href="#inspecciones-recientes">
              Inspecciones recientes
            </a>
          </nav>
        </div>
      </header>

      <main id="contenido-principal">{children}</main>

      <footer className="app-footer">
        <p>App shell · Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
      </footer>
    </div>
  );
}