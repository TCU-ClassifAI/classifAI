import { Modal, Button } from "react-bootstrap";
export default function ErrorModal({
  message = "An Error has occured",
  showErrorModal = false,
  handleCloseErrorModal = () => {
  },
}) {
  return (
    <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseErrorModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
