import { LoginForm } from "@/components/login-form";
import { Section } from "@/components/ui";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Section>
      <LoginForm />
    </Section>
  );
}
