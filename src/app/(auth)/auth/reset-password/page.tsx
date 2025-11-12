import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { token } = await searchParams;

  return <ResetPasswordForm token={token as string} />;
};

export default ResetPasswordPage;
