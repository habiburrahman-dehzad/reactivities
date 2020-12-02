import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const PhotoWidgetCropper = ({ setImage, imagePreview }) => {
  const cropperRef = useRef(null);

  const cropImage = () => {
    if (
      cropperRef.current &&
      typeof cropperRef.current.cropper.getCroppedCanvas() === "undefined"
    ) {
      return;
    }

    cropperRef &&
      cropperRef.current &&
      cropperRef.current.cropper &&
      cropperRef.current.cropper.getCroppedCanvas().toBlob((blob) => {
        setImage(blob);
      }, "image/jpeg");
  };

  return (
    <Cropper
      src={imagePreview}
      style={{ height: 200, width: "100%" }}
      // Cropper.js options
      preview='.img-preview'
      initialAspectRatio={1 / 1}
      guides={false}
      ref={cropperRef}
      viewMode={1}
      dragMode="move"
      scalable={true}
      cropBoxMovable={true}
      cropBoxResizable={true}
      crop={cropImage}
    />
  );
};

export default PhotoWidgetCropper;
