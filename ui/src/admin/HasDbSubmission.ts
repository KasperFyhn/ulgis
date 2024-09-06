export default interface HasDbSubmission {
  onSuccessfulSubmit?: () => void;
  onFailedSubmit?: () => void;
}
