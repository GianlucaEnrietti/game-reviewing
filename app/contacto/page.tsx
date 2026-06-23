import Container from "../../components/container";
import ContactForm from "../../components/contact-form";

export const metadata = {
  title: "Contacto",
  description: "Envianos tu consulta por email.",
};

export default function ContactPage() {
  return (
    <Container>
      <section className="mx-auto max-w-xl pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 md:text-5xl">
          Contacto
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Escribinos y te respondemos a tu email lo antes posible.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </section>
    </Container>
  );
}
