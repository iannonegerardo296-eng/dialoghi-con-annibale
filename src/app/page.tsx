import { ArrowRight, BookOpenText } from "lucide-react";
import Link from "next/link";
import { AnnibalAvatar } from "@/components/AnnibalAvatar";
import { LandingHero } from "@/components/LandingHero";

export default function Home() {
  return (
    <main className="app-shell landing-page">
      <div className="landing-container">
        <header className="landing-header">
          <Link className="landing-brand" href="/" aria-label="Dialoghi con Annibale, pagina iniziale">
            <span className="sidebar-brand-mark" aria-hidden="true">H</span>
            <span>
              <strong>Dialoghi</strong>
              <small>con Annibale</small>
            </span>
          </Link>
          <Link className="landing-header-link" href="/chat">
            Entra nel dialogo <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </header>

        <LandingHero />

        <section className="landing-introduction" aria-labelledby="landing-introduction-title">
          <div className="landing-portrait">
            <AnnibalAvatar status="listening" />
            <span>Rappresentazione artistica</span>
          </div>
          <div className="landing-introduction-copy">
            <span className="eyebrow">Non una lezione. Un incontro.</span>
            <h2 id="landing-introduction-title">Ascolta il suo punto di vista. Interrogane le scelte.</h2>
            <p>
              Parla con una voce immaginata di Annibale: autorevole, curiosa e consapevole
              dei limiti delle testimonianze antiche. Le sue parole sono una ricostruzione,
              non una citazione autentica.
            </p>
            <Link className="landing-start-link" href="/chat">
              Inizia una conversazione <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="landing-method" id="historical-note" aria-label="Metodo storico">
          <BookOpenText size={17} aria-hidden="true" />
          <p>
            <strong>Una conversazione guidata dalle fonti.</strong> I fatti documentati,
            le interpretazioni e le incertezze vengono distinti; emozioni e pensieri
            personali sono ricostruzioni dichiarate come tali.
          </p>
          <Link href="/chat">Scopri Annibale <ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <footer className="landing-footer">
          <span>Dialoghi con Annibale · Cartagine, III secolo a.C.</span>
          <span>Storia, interpretazione, incertezza.</span>
        </footer>
      </div>
    </main>
  );
}
