import { Link } from 'react-router-dom'

function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLinkText }) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">H</div>
        <div className="auth-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        <p className="auth-footer">
          {footerText} <Link to={footerLink}>{footerLinkText}</Link>
        </p>
      </section>
    </main>
  )
}

export default AuthLayout
