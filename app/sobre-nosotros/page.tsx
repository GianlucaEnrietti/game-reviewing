import Container from "../../components/container";

export const metadata = {
  title: "Sobre nosotros",
  description: "Conoce más sobre Vicios y Noticias.",
};

export default function AboutPage() {
  return (
    <Container>
      <section className="max-w-3xl pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 md:text-5xl">
          Sobre nosotros
        </h1>

        <div className="mt-8 space-y-4 text-lg leading-relaxed text-slate-300">
          <p>
            Vicios y Noticias es un pequeño proyecto hecho por y para amantes a los videojuegos, completamente gratuito y sin publicidad.
            <br />
            Actualmente, contamos con un minimo equipo para generar contenido y la web sigue en constanste desarrollo.
            <br />
            Si tienes alguna sugerencia o quieres colaborar, no dudes en contactarnos.
            <br />
          </p>
          <p>
            Si quieres saber más sobre nosotros, puedes contactarnos a través de nuestras redes sociales.
          </p>
        </div>
      </section>
    </Container>
  );
}
