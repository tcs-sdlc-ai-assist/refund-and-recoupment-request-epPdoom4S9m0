import { RequestForm } from '../components/RequestForm';

/**
 * Create/Edit Request page component.
 * Wraps the RequestForm component which internally reads route params
 * to determine create vs edit mode and handles navigation.
 *
 * @returns {JSX.Element} The rendered CreateEditRequest page
 */
export function CreateEditRequest() {
  return (
    <div>
      <RequestForm />
    </div>
  );
}

export default CreateEditRequest;