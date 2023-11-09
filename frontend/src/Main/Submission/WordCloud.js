import React, { useState } from "react";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

const colors = ["#143059", "#2F6B9A", "#82a6c2"];

/**
 * wordFreq takes a string of text and returns an array of objects containing the top 100 most frequent words
 * @param {string} text - The raw text to be analyzed
 * @returns an array of objects containing the top 100 most frequent words and their frequencies
 */
function wordFreq(text) {
    // Define common words to exclude
    const commonWords = ['the', 'a', 'in', 'it', 'of', 'and', 'it', 'is', 'i', 'to', 'that', 'this']; // This is hard-coded for now, but we can make it more dynamic later
  

    //Remove punctuation and split the text into words
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const words = text.replace(/\./g, "").split(/\s/);
  
    // Create a frequency map
    const freqMap = {};
  
    for (const w of words) {
      // Convert the word to lowercase to make it case-insensitive
      const word = w.toLowerCase();
  
      // Skip common words
      if (commonWords.includes(word)) {
        continue;
      }
  
      if (!freqMap[word]) freqMap[word] = 0;
      freqMap[word] += 1;
    }
  
    // Convert the frequency map to an array of objects
    const wordFreqArray = Object.keys(freqMap).map((word) => ({
      text: word,
      value: freqMap[word]
    }));
  
    // Sort the words by frequency in descending order
    wordFreqArray.sort((a, b) => b.value - a.value);
  
    // Take the top 100 words (maybe add a slider later?)
    const top100Words = wordFreqArray.slice(0, 100);
  
    return top100Words;
  }


function getRotationDegree() {
  const rand = Math.random();
  const degree = rand > 0.5 ? 60 : -60;
  return rand * degree;
}





const fixedValueGenerator = () => 0.5;

/**
 * This component is a wrapper for the Wordcloud component from @visx/wordcloud. It takes in a transcript and returns a word cloud.
 * @param {number} width - The width of the word cloud
 * @param {number} height - The height of the word cloud
 * @param {boolean} showControls - Whether or not to show the controls for the word cloud
 * @param {string} transcript - The transcript to be analyzed
 * @returns a word cloud (JSX)
 */
export default function WordCloud({ width, height, showControls, transcript= " "}) {
  const [spiralType, setSpiralType] = useState("archimedean");
  const [withRotation, setWithRotation] = useState(false);

  const words = wordFreq(transcript);

  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value))
    ],
    range: [10, 100]
  });
  const fontSizeSetter = (datum) => fontScale(datum.value);

  return (
    <div className="wordcloud">
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={"Impact"}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      {showControls && (
        <div>
          <label>
            Spiral type &nbsp;
            <select
              onChange={(e) => setSpiralType(e.target.value)}
              value={spiralType}
            >
              <option key={"archimedean"} value={"archimedean"}>
                archimedean
              </option>
              <option key={"rectangular"} value={"rectangular"}>
                rectangular
              </option>
            </select>
          </label>
          <label>
            With rotation &nbsp;
            <input
              type="checkbox"
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
          <br />
        </div>
      )}
      <style jsx="true">{`
        .wordcloud {
          display: flex;
          flex-direction: column;
          user-select: none;
        }
        .wordcloud svg {
          margin: 1rem 0;
          cursor: pointer;
        }

        .wordcloud label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          margin-right: 8px;
        }
        .wordcloud textarea {
          min-height: 100px;
        }
      `}</style>
    </div>
  );
}
