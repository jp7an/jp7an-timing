import LiveView from "../../../components/LiveView";
export default function Page({ params }: { params: { slug: string } }) {
  return <LiveView slug={params.slug} mode="auto" />;
}