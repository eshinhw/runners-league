export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <main>
      <h1>@{username}</h1>
    </main>
  );
}
