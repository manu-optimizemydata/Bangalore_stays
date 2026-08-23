import { redirect } from "next/navigation";
import { RegisterWizard } from "@/app/owners/register/register-wizard";
import { getOwnerSession } from "@/lib/owner-auth";

export const metadata = {
  title: "Register your home",
};

export default async function OwnerRegisterPage() {
  const owner = await getOwnerSession();
  if (owner) {
    redirect("/owners/dashboard");
  }

  return (
    <div className="px-5 py-12">
      <RegisterWizard />
    </div>
  );
}
