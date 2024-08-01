import logo from "./logo.svg";
import "./App.css";
import "./Cake.scss";
import { useState, useEffect } from "react";
import useMicrophone from "./UseMicrophone";
import { randNumInRange, normRand } from "./utils/functions";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

function App() {
  const [candlePositions, setCandlePositions] = useState([]);
  const { microphoneVolume, stopMicrophone } = useMicrophone();
  const [renderedCandles, setRenderedCandles] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const blowOutCandle = (candle) => {
    setCandlePositions((prevPositions) =>
      prevPositions.map((position) => {
        return position.x === candle.x && position.y === candle.y
          ? { ...position, isLit: false }
          : position;
      })
    );
  };

  const blowOutAllCandles = async () => {
    if (renderedCandles !== candlePositions.length) {
      return;
    }

    // Filter the candles that are currently lit
    const litCandles = candlePositions.filter((candle) => candle.isLit);

    // Iterate through each lit candle and blow it out
    for (const candle of litCandles) {
      // We use random percentage chance to blow out the candle to simulate realistic blowing
      // If no microphone input, we use Math.random() to simulate blowing
      // The louder the microphone input, the higher the success rate
      // const successRate = microphoneVolume  === 0 ? Math.random() * 100 : microphoneVolume;
      const successRate = Math.min(100, normRand() * 100 + microphoneVolume);

      await new Promise((resolve) => {
        // Call blowOutCandle function after a short delay
        setTimeout(() => {
          // If the success rate is higher than 95%, blow out the candle
          if (successRate > 70) {
            blowOutCandle(candle); // Pass the candle object to the blowOutCandle function
          }
          resolve();
        }, Math.max(0, 50 - Number(microphoneVolume))); // Convert microphoneVolume to number before performing arithmetic operation
        /* The delay for timeout speed (in milliseconds) 
            the louder the microphone input, the shorter the time between blowOutCandle calls */
      });

      if (candlePositions.filter((candle) => candle.isLit).length === 0) {
        stopMicrophone();
        console.log("Microphone stopped");
      }
    }
  };

  useEffect(() => {
    const cakeWidth = document.querySelector(".cake").offsetWidth;
    const icingHeight = document.querySelector(".icing").offsetHeight;
    const numberOfCandles = 10; // Number of candles you want to place on the cake

    // Generate random x and y coordinates for each candle
    const positions = Array.from({ length: numberOfCandles }, () => {
      // Random x coordinate between 12% and 88% of the cake width
      const randomX = Math.floor(
        Math.random() * (cakeWidth * 0.76) + cakeWidth * 0.12
      );
      // Random y coordinate between the icing height - 115 and icing height - 75
      const randomY = Math.floor(
        randNumInRange(icingHeight - 115, icingHeight - 75)
      );

      return { x: randomX, y: randomY, isLit: true };
    });

    // Sort the positions based on y-coordinate in descending order
    positions.sort((a, b) => b.y - a.y);

    setCandlePositions(positions);
  }, []); // Render the candles only once when the component mounts

  useEffect(() => {
    console.log(microphoneVolume);

    if (microphoneVolume >= 35) {
      blowOutAllCandles();
    }

    // Log the number of lit candles
    console.log(
      "Lit candles: ",
      candlePositions.filter((candle) => candle.isLit)
    );
  }, [microphoneVolume]); // Trigger the effect when the microphoneVolume changes

  useEffect(() => {
    // Check if there are no lit candles
    const litCandles = candlePositions.filter((candle) => candle.isLit);
    if (!litCandles.length && renderedCandles === candlePositions.length) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [candlePositions, renderedCandles]); // Trigger the effect when candle positions or rendered candles change

  useEffect(() => {
    showConfetti &&
      setTimeout(() => {
        setShowConfetti(false);
      }, 15000);
  }, [showConfetti]);

  return (
    <>
      <div className="flex flex-col justify-center">
        <AnimatePresence>
          {showConfetti && (
            <div className="flex flex-col justify-center">
              <Confetti
                numberOfPieces={150}
                gravity={0.2}
                initialVelocityY={8}
                initialVelocityX={5}
                width={width}
                height={height}
                colors={["#FF6894", "#FF1493", "#FFB6C1"]}
                drawShape={(ctx) => {
                  ctx.beginPath();
                  const scale = 0.6; // Adjust scale to fit the shape within the canvas
                  for (let t = 0; t < Math.PI * 2; t += 0.01) {
                    // Parametric equations for a heart
                    const x = scale * 16 * Math.pow(Math.sin(t), 3);
                    const y =
                      -scale *
                      (13 * Math.cos(t) -
                        5 * Math.cos(2 * t) -
                        2 * Math.cos(3 * t) -
                        Math.cos(4 * t));
                    ctx.lineTo(x, y);
                  }
                  ctx.fill(); // Fill the heart shape
                  ctx.closePath();
                }}
              />
              <div className="flex items-center justify-center h-screen">
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-5 text-white relative items-center justify-center"
                  style={{ position: "relative", bottom: "200px" }}
                >
                  <p className="capitalize font-medium lg:text-5xl md:text-3xl text-lg">
                    happy national bubby day! 🎉
                  </p>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="cake">
          <div className="plate"></div>
          <div className="layer layer-bottom"></div>
          <div className="layer layer-middle"></div>
          <div className="layer layer-top"></div>
          <div className="icing"></div>
          <div className="drip drip1"></div>
          <div className="drip drip2"></div>
          <div className="drip drip3"></div>

          {/* Add candles to the cake
              Note: we want to use slide() to create a temporary copy and reverse its order
              This way, the candles are rendered from the top to bottom
              Making the bottom candles cover the top ones, avoiding overlapping*/
          /* Due to the limited hardward of smartphones, we need to set different framer motion
              render speed to reduce stagger effect */}

          {candlePositions
            .slice()
            .reverse()
            .map((candlePosition, index) => (
              <motion.div // We use Framer Motion to animate the candle dropping from the top animation
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.03,
                }}
                // Candle properties
                key={index}
                className="candle"
                style={{
                  left: `${candlePosition.x}px`,
                  top: `${candlePosition.y}px`,
                }}
                // Keep track of rendered candles to prevent blowing candles during rendering
                onAnimationComplete={() =>
                  setRenderedCandles((prevCount) => prevCount + 1)
                }
              >
                {candlePosition.isLit && (
                  <motion.div // We use Framer Motion to animate the flame going out
                    className="flame"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // The larger the age, the slower the duration of the flame going out to prevent lag
                    transition={{ duration: 0.6 }}
                  />
                )}

                <div className="candle-wick"></div>
              </motion.div>
            ))}
        </div>
      </div>
    </>
  );
}

export default App;
