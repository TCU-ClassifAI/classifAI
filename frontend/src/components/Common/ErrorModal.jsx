import { Modal, Button } from "react-bootstrap";
export default function ErrorModal({
  message,
  showErrorModal,
  handleCloseErrorModal,
}) {
  return (
    <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        There was an error in the analysis process. Please try again later.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseErrorModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
