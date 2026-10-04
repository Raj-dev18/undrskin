import { redirect } from 'next/navigation';

/** The original UndrSkin demo is the canonical home experience. */
export default function HomePage() {
  redirect('/undrskin-3d-demo.html');
}
