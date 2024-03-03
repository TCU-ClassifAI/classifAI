import { Modal, Button } from "react-bootstrap";
export default function GenericModal({
  title,
  message,
  showGenericModal,
  handleCloseGenericModal,
}) {
  return (
    <Modal show={showGenericModal} onHide={handleCloseGenericModal}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseGenericModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
