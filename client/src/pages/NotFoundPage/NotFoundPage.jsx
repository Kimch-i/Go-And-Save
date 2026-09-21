import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <>
      <h1>This page does not exist</h1>
      <p>
        <Link to="/">Go to the trip planner</Link>
      </p>
    </>
  );
}
