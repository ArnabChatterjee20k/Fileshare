import { useOrganization, useUser } from "@clerk/nextjs";
export default function useAuth() {
  const organization = useOrganization();
  const user = useUser();

  let orgId = null;
  if (organization.isLoaded && user?.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  return {user,orgId,organization}
}