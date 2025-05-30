import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-semibold">Bibliothèque Moderne</span>
          </div>
          <p className="text-primary-foreground/80">
            Votre destination pour la découverte littéraire et l'apprentissage continu.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Liens rapides</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link
                to="/catalogue"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/reservation"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Réservation
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Horaires</h3>
          <ul className="space-y-2 text-primary-foreground/80">
            <li>Lundi - Vendredi: 9h - 19h</li>
            <li>Samedi: 10h - 18h</li>
            <li>Dimanche: Fermé</li>
          </ul>
        </div>
      </div>

      <div className="container border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
        <p>© {new Date().getFullYear()} Bibliothèque Moderne. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

export default Footer
