import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Quagga from 'quagga'; // Barcode scanner library

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef(null);
  


  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      processBarcode(imageSrc); // Process the image for barcode scanning
    }
  }, [webcamRef]);

  // Function to process the captured image and scan for barcodes using Quagga
  const processBarcode = (imageSrc) => {
    console.log(imageSrc);
    Quagga.decodeSingle({
      decoder: {

        readers: [
            "code_128_reader", 
            "ean_reader",       
            "upc_reader",      
            "code_39_reader",   
            "i2of5_reader"      
          ] 
      },
      locate: true,
      src: imageSrc
    }, function (result) {
      if (result && result.codeResult) {
        setBarcode(result.codeResult.code);
        setIsScanning(false); 
        console.log("Barcode found: ", result.codeResult.code);
        
        fetch('http://127.0.0.1:5000/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ barcode: result.codeResult.code }),
        })
        .then((response) => {
          if (response.ok) {
            alert('Barcode saved successfully');
          } else {
            console.log('Error saving barcode');
          }
        });
      }
    });
  };

  const startScanning = () => {
    setIsScanning(true);
    setBarcode(''); 
  };


  const restartScanning = () => {
    setIsScanning(true); 
    setBarcode('');
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Scan a Barcode</h1>
      <button onClick={startScanning} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Start Scan'}
      </button>

      {isScanning && (
        <div style={{ margin: '20px auto', width: '100%', maxWidth: '400px' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
          />
          <button onClick={capture} style={{ marginTop: '10px' }}>
            Capture
          </button>
        </div>
      )}
      {!isScanning && barcode && (
        <div>
          <p>Scanned Barcode: {barcode}</p>
          <button onClick={restartScanning}>Scan Again</button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
