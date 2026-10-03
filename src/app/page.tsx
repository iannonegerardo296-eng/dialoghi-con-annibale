import { BookOpenText } from "lucide-react";
import Link from "next/link";
import { LandingHero } from "@/components/LandingHero";
import { LandingScrollMotion } from "@/components/LandingScrollMotion";

export default function Home() {
  return (
    <main className="app-shell landing-page">
      <LandingScrollMotion />
      <div className="landing-container">
        <header className="landing-header">
          <Link className="landing-brand" href="/" aria-label="Dialoghi con Annibale, pagina iniziale">
            <span>
              <strong>Dialoghi</strong>
              <small>con Annibale</small>
            </span>
          </Link>
          <nav className="landing-header-actions" aria-label="Navigazione principale">
            <a className="landing-header-method" href="#historical-note">Il metodo</a>
          </nav>
        </header>

        <LandingHero />

        <section className="landing-introduction" aria-labelledby="landing-introduction-title">
          <div className="landing-introduction-copy">
            <span className="eyebrow">Un dialogo, con metodo</span>
            <h2 id="landing-introduction-title">Le fonti prima delle certezze.</h2>
            <p>
              Incontra una voce ricostruita di Annibale: le testimonianze, le ipotesi e
              ciò che non possiamo sapere restano distinti.
            </p>
          </div>
          <div className="landing-principles" aria-label="Principi del dialogo">
            <article>
              <span>01</span>
              <div>
                <h3>Documentato</h3>
                <p>Le affermazioni storiche si basano su fonti consultabili.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Trasparente</h3>
                <p>Quando le fonti divergono, la risposta lo dichiara.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Ricostruito</h3>
                <p>La voce è immaginata: non è una citazione autentica.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-method" id="historical-note" aria-label="Metodo storico">
          <BookOpenText size={17} aria-hidden="true" />
          <p>
            <strong>Una ricostruzione, non una lezione definitiva.</strong> Le fonti antiche
            sono frammentarie e spesso di parte. Il dialogo segnala dove finisce la
            testimonianza e inizia l&apos;interpretazione.
          </p>
        </section>

        <footer className="landing-footer">
          <span>Dialoghi con Annibale · Cartagine, III secolo a.C.</span>
          <span>Storia, interpretazione, incertezza.</span>
        </footer>
      </div>
    </main>
  );
}
