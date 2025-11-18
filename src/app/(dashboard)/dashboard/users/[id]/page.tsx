
import { UserProfile } from "@/components/dashboard/users/UserProfile";

const UserDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <UserProfile userId={id} />;
};

export default UserDetailPage;
