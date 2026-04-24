'use client';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bru-footer">
      <div className="bru-footer-inner">
        <div className="mega">
          AUTMZR<span className="v">/</span>COMMAND
        </div>

        <div className="bru-footer-cols">
          <div className="bru-footer-col">
            <h4>BRAND</h4>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, fontWeight: 500, margin: 0, maxWidth: 280 }}>
              Part of the Autmzr family — automation tools for builders.
            </p>
          </div>

          <div className="bru-footer-col">
            <h4>PRODUCT</h4>
            <ul>
              <li><a href="/">Sign in</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li>
                <a
                  href="https://github.com/autmzr/autmzr-command"
                  target="_blank"
                  rel="noreferrer"
                >GitHub</a>
              </li>
            </ul>
          </div>

          <div className="bru-footer-col">
            <h4>RESOURCES</h4>
            <ul>
              <li>
                <a
                  href="https://github.com/autmzr/autmzr-command#readme"
                  target="_blank"
                  rel="noreferrer"
                >Docs</a>
              </li>
              <li>
                <a
                  href="https://github.com/autmzr/autmzr-command/issues"
                  target="_blank"
                  rel="noreferrer"
                >Report a bug</a>
              </li>
              <li>
                <a
                  href="https://github.com/autmzr/autmzr-command/releases"
                  target="_blank"
                  rel="noreferrer"
                >Changelog</a>
              </li>
            </ul>
          </div>

          <div className="bru-footer-col">
            <h4>LEGAL</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="mailto:hello@autmzr.com">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="bru-footer-bar">
          <span>MADE BY AUTMZR · MIT LICENSE · {year}</span>
          <span>v0.1.0 · BRUTALIST EDITION</span>
        </div>
      </div>
    </footer>
  );
}
