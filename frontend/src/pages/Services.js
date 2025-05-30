import { BookOpen, BookMarked, Laptop, Newspaper, Users, Calendar } from "lucide-react"

function ServicesPage() {
  const services = [
    {
      title: "Consultation sur place",
      description:
        "Accédez à notre collection complète dans un espace calme et confortable, idéal pour l'étude et la recherche.",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Emprunt de livres",
      description:
        "Empruntez jusqu'à 5 livres pour une durée de 2 semaines, avec possibilité de prolongation en ligne.",
      icon: <BookMarked className="h-6 w-6" />,
    },
    {
      title: "Ressources numériques",
      description:
        "Explorez notre vaste collection de livres électroniques, de bases de données en ligne et de ressources académiques.",
      icon: <Laptop className="h-6 w-6" />,
    },
    {
      title: "Presse et magazines",
      description: "Consultez les derniers numéros de journaux et magazines nationaux et internationaux.",
      icon: <Newspaper className="h-6 w-6" />,
    },
    {
      title: "Clubs de lecture",
      description:
        "Rejoignez nos clubs de lecture mensuels pour discuter et partager vos impressions sur des livres sélectionnés.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Événements culturels",
      description: "Participez à nos conférences, ateliers et rencontres avec des auteurs organisés régulièrement.",
      icon: <Calendar className="h-6 w-6" />,
    },
  ]

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Nos Services</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Découvrez tous les services que notre bibliothèque moderne met à votre disposition pour enrichir votre
          expérience de lecture et d'apprentissage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 border-t-4 border-t-primary"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Horaires d'ouverture</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Jours de semaine</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-medium">9h - 19h</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Week-end</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Samedi</span>
                <span className="font-medium">10h - 18h</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche</span>
                <span className="font-medium">Fermé</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServicesPage
