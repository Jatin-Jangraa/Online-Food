import { RegisterForm } from "@/components/register-form";
import { Section } from "@/components/ui";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <Section>
      <RegisterForm />
    </Section>
  );
}
