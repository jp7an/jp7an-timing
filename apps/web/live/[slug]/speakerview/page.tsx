import SpeakerView from "../../../../components/SpeakerView";
export default function Page({ params }: { params: { slug: string } }) {
  return <SpeakerView slug={params.slug} />;
}