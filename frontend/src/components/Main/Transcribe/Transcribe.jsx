import React, { useState, useEffect } from "react";
import { knowledgeArray } from "../../../expertArrays/knowledge";
import { understandArray } from "../../../expertArrays/understand";
import { applyArray } from "../../../expertArrays/apply";
import { analyzeArray } from "../../../expertArrays/analyze";
import { evaluateArray } from "../../../expertArrays/evaluate";
import { createArray } from "../../../expertArrays/create";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import CsvOptions from "./CsvOptions";
import QuestionCategoryDistribution from "./QuestionCategoryDistribution";
import TalkingDistribution from "./TalkingDistribution";
import CollapsedTimeline from "./CollapsedTimeline";
import TeacherQuestionTimeline from "./TeacherQuestionTimeline";
import UploadRecording from "./UploadRecording";
import FullTranscript from "./FullTranscript";
import PdfOptions from "./PdfOptions";
import Questions from "./Questions";
import ReportName from "./ReportName";

import "./transcribe.css";
import "./transcript.scss";
import WordCloud from "./WordCloud";

import { Tab, Tabs } from "react-bootstrap";
/* TODO Fix Saving Reports to S3 and reloading into page
import { Auth } from "aws-amplify";
import AWS from "aws-sdk";
*/
import { useLocation, useNavigate } from "react-router-dom";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

export default function Transcribe() {
  const [transcript, setTranscript] = useState();
  const [sentences, setSentences] = useState();
  const [respTime, setRespTime] = useState();
  const [times, setTimes] = useState();
  const [speakers, setSpeakers] = useState();

  const [questions, setQuestions] = useState();
  const [labeledQuestions, setLabeledQuestions] = useState();
  const [questioningTime, setQuestioningTime] = useState();
  const [reportName, setReportName] = useState("");

  const [successfullUpload, setSuccessfullUpload] = useState(false);
  const [badReportName, setBadReportName] = useState(false);
  const [teacher, setTeacher] = useState();
  const [show, setShow] = useState(false);

  let navigate = useNavigate();

  const location = useLocation();
  const userReportToLoad = location.state?.data;
  const userReportLocation = location.state?.location;

  const labelColors = {
    Knowledge: "#0000FF",
    Understand: "#D42AC8",
    Apply: "#009400",
    Analyze: "#FF7300",
    Evaluate: "#FFC400",
    Create: "#7C7670",
  };

  useEffect(() => {
    checkLoadReport();
  }, [userReportToLoad]);

  useEffect(() => {
    if (sentences) {
      createTranscript();
      findQuestions();
      findSpeakers();
      toResponse();
      printTimes();
      getTimeChartProps();
    }
  }, [sentences, setSentences]);

  useEffect(() => {
    if (questions) {
      toResponse();
      printTimes();
      getTimeChartProps();
    }
  }, [questions]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function findSpeakers() {
    const speakersSet = new Set(speakers);

    sentences.forEach((sentence) => {
      speakersSet.add(sentence.speaker);
    });
    setSpeakers(speakersSet);
  }

  function checkLoadReport() {
    if (userReportToLoad) {
      setSentences(userReportToLoad);
    }
  }

  function createTranscript() {
    let transcript = "";
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        transcript += " " + sentences[i].text;
      }
      setTranscript(transcript);
      setTeacher(getMaxSpeaker());
    }
  }

  function findQuestions() {
    let qs = [];
    if (sentences) {
      if (userReportToLoad) {
        for (let i = 0; i < userReportToLoad.length; i++) {
          if (userReportToLoad[i].isQuestion === true) {
            qs.push(userReportToLoad[i]);
          }
        }
        setQuestions(qs);
        findQuestionsLabels(qs);
        return qs;
      } else {
        //added so that not all question marks are identified as questions every time a question is added
        if (sentences.some((sentence) => sentence.isQuestion)) {
          for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].isQuestion === true) {
              qs.push(sentences[i]);
            } else {
              sentences[i].isQuestion = false;
              sentences[i].label = "non-question";
            }
          }
        } else {
          for (let i = 0; i < sentences.length; i++) {
            if (
              sentences[i].text.includes("?") ||
              sentences[i].isQuestion === true
            ) {
              qs.push(sentences[i]);
              sentences[i].isQuestion = true;
              sentences[i].label = "";
            } else {
              sentences[i].isQuestion = false;
              sentences[i].label = "non-question";
            }
          }
        }
        setQuestions(qs);
        findQuestionsLabels(qs);
        return qs;
      }
    }
  }

  function toResponse() {
    if (questions) {
      // const isQuestion = (sentence) => sentences.some((question) => question.isQuestion === sentence.isQuestion);
      const isQuestion = (sentence) =>
        questions.some((question) => question.text === sentence.text);
      // console.log(isQuestion)

      let stamps = sentences.reduce((acc, current, index, arr) => {
        const isCurrentQuestion = isQuestion(current);
        const isNextNonQuestionAndDifferentSpeaker =
          index < arr.length - 1 &&
          !isQuestion(arr[index + 1]) &&
          arr[index + 1].speaker !== current.speaker;

        if (isCurrentQuestion) {
          acc[current.end] = isNextNonQuestionAndDifferentSpeaker
            ? (arr[index + 1].start - current.end) / 1000
            : "No Response";
          //
          //
        }
        return acc;
      }, {});
      setRespTime(stamps);
    }
  }

  function printTimes() {
    if (questions) {
      let sStamps = [];
      let speaks = [];
      let qDur = 0;
      for (let i = 0; i < questions.length; i++) {
        qDur += questions[i].end - questions[i].start;
        sStamps.push(convertMsToTime(questions[i].start));
        speaks.push(questions[i].speaker);
      }
      setQuestioningTime(convertMsToTime(qDur));
      setTimes(sStamps);
      setSpeakers(speaks);
      return sStamps;
    }
  }

  function findQuestionsLabels(quests) {
    //console.log("quests:")
    //console.log(quests)
    let labeled = [quests.length];
    const categoryMap = {
      Knowledge: knowledgeArray,
      Analyze: analyzeArray,
      Apply: applyArray,
      Create: createArray,
      Evaluate: evaluateArray,
      Understand: understandArray,
    };

    if (userReportToLoad) {
      labeled = userReportToLoad
            .filter((sentence) => sentence.label !== "non-question")
            .map((sentence) => sentence.label);

      setLabeledQuestions(labeled);
    } else {
      const sanitizeWord = (word) =>
        word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").replace(/\s{2,}/g, " ");

      const findCategories = (word) =>
        Object.keys(categoryMap)
          .filter((key) => categoryMap[key].includes(word))
          .join(" or ");

      if (
        sentences.some(
          (sentence) =>
            sentence.isQuestion &&
            sentence.label !== "Uncategorized" &&
            sentence.label !== ""
        )
      ) {
        labeled = quests.filter((quest) => quest.label !== "non-question").map((quest) => quest.label);

      } else {
        labeled = quests.map((quest) => {
          const words = quest.words.map((wordObj) =>
            sanitizeWord(wordObj.text)
          );
          for (const word of words) {
            const category = findCategories(word);
            if (category) {
              return category;
            }
          }
          return "Uncategorized";
        });
      }

      for (let i = 0; i < quests.length; i++) {
        quests[i].label = labeled[i];
      }

      for (let j = 0; j < quests.length; j++) {
        for (let k = 0; k < sentences.length; k++) {
          if (quests[j].start === sentences[k].start) {
            sentences[k].label = quests[j].label;
          }
        }
      }
      //
      setLabeledQuestions(quests);
    }
  }

  function getMaxSpeaker() {
    let speakTimeList1 = totalSpeakers();
    let maxSpeakerName = "";
    let maxSpeakerDuration = 0;
    let tempSpeaker = 0;
    if (speakTimeList1) {
      for (let i = 0; i < speakTimeList1.length; i++) {
        tempSpeaker = getSpeakingTime(speakTimeList1[i]);

        if (tempSpeaker > maxSpeakerDuration) {
          maxSpeakerDuration = tempSpeaker;
          maxSpeakerName = speakTimeList1[i];
        }
      }
      return maxSpeakerName;
    }
  }

  function setTimeChartData() {
    if (sentences) {
      let timeData = [];
      let questionList = sentences.filter(
        (item) =>
          item.isQuestion && Object.keys(labelColors).includes(item.label)
      );

      // Calculate the total time range of the timeline
      const minTime = Math.min(...sentences.map((s) => s.start / 1000));
      const maxTime = Math.max(...sentences.map((s) => s.start / 1000));
      const totalTimeRange = maxTime - minTime;

      Math.min(...sentences.map((s) => s.start));

      // Define the percentage of the total time range to use as the constant width for the entries
      const entryWidthPercentage = 0.04; // Adjust this value as needed
      const constantWidth = totalTimeRange * entryWidthPercentage;

      for (let label in labelColors) {
        let initialEntry = {
          x: label,
          y: [0, 0],
          fillColor: labelColors[label],
        };
        timeData.push(initialEntry);
      }

      for (let i = 0; i < questionList.length; i++) {
        if (labelColors.hasOwnProperty(questionList[i].label)) {
          let entry = {
            x: questionList[i].label,
            y: [
              questionList[i].start,
              questionList[i].start + constantWidth * 1000,
            ],
            fillColor: labelColors[questionList[i].label],
          };
          timeData.push(entry);
        }
      }
      //console.log("timeData:");
      //console.log(timeData);
      return timeData;
    }
  }

  function buildTalkingDistributionSeries() {
    return [
      getSpeakingTime(getMaxSpeaker()),
      sumSpeakingTime() - getSpeakingTime(getMaxSpeaker()),
      getNonSpeakingTime(sentences),
    ];
  }

  function getTimeChartProps(sentences) {
    return {
      series: [
        {
          data: setTimeChartData(),
        },
      ],
      options: {
        chart: {
          type: "rangeBar",
        },
        title: {
          text: "Teacher Question Timeline",
          align: "left",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: undefined,
            color: "#263238",
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function (val) {
              return convertMsToTime(val);
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "20px",
            },
          },
          categories: [
            "Knowledge",
            "Understand",
            "Apply",
            "Analyze",
            "Evaluate",
            "Create",
          ],
        },
        tooltip: {
          enabled: true,
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            //because 6 init entries
            let tooltipIndex = dataPointIndex - 6;
            let questionList = sentences.filter((item) => item.isQuestion);
            //console.log("copy of sentences: ")
            //console.log(sentences)
            let question = questionList[tooltipIndex];
            //console.log("GOT HERE")
            //console.log("data point index: " + tooltipIndex)
            //console.log(questionList)
            return (
              '<div class="arrow_box">' +
              "<span><strong>Speaker " +
              question.speaker +
              ": </strong>" +
              question.text +
              "</span><br>" +
              "<span>" +
              convertMsToTime(question.start) +
              "-" +
              convertMsToTime(question.end) +
              "</span>" +
              "</div>"
            );
          },
        },
      },
    };
  }

  function getNonSpeakingTime(sentences) {
    if (sentences)
      return (
        sentences[sentences.length - 1].end -
        sentences[0].start -
        sumSpeakingTime(sentences)
      );
  }

  function getSpeakingTime(speakerName) {
    let speakingTime = 0;
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].speaker === speakerName) {
          speakingTime += sentences[i].end - sentences[i].start;
        }
      }
    }
    return speakingTime;
  }

  function sumSpeakingTime() {
    if (sentences) {
      let totalTime = 0;
      for (let i = 0; i < sentences.length; i++) {
        totalTime += sentences[i].end - sentences[i].start;
      }
      return totalTime;
    }
  }

  function totalSpeakers() {
    let speakerList = [];
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (!speakerList.includes(sentences[i].speaker)) {
          speakerList.push(sentences[i].speaker);
        }
      }
      return speakerList;
    }
  }

  const handleClickOutside = (event) => {
    if (!event.target.closest(".dropdown")) {
      setShow(null);
    }
  };

  function reloadPage() {
    navigate("/home/transcribe");
    window.location.reload();
  }

  /* 
  * TODO add task to make use of this function
  async function saveUserObject() {
    AWS.config.update({
      region: "us-east-2",
      apiVersion: "latest",
      credentials: {
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ID,
      },
    });

    const s3 = new AWS.S3();
    if (userReportToLoad) {
      var data = {
        Bucket: "c2ai-storage-e5d3ddbc163336-staging",
        Key: userReportLocation,
        Body: JSON.stringify(sentences),
        ContentEncoding: "base64",
        ContentType: "application/json",
        ACL: "public-read",
      };

      s3.putObject(data, function (err, data) {
        if (err) {
        } else {
          setSuccessfullUpload(true);
        }
      });
    } else {
      const user = await Auth.currentAuthenticatedUser();
      const folderName = user.username;
      const location = folderName + "/" + reportName;
      if (reportName === "") {
        setBadReportName(true);
      } else {
        setBadReportName(false);
        var data = {
          Bucket: "c2ai-storage-e5d3ddbc163336-staging",
          Key: location,
          Body: JSON.stringify(sentences),
          ContentEncoding: "base64",
          ContentType: "application/json",
          ACL: "public-read",
        };
        s3.putObject(data, function (err, data) {
          if (err) {
          } else {
            setSuccessfullUpload(true);
          }
        });
      }
    }
  }
*/

  return (
    <div>
      <UploadRecording
        userReportToLoad={userReportToLoad}
        userReportLocation={userReportLocation}
        sentences={sentences}
        setSentences={setSentences}
      />
      {sentences && (
        <div>
          <Tabs id="controlled-tab-example">
            <Tab eventKey="TranscriptKey" title="Full Transcript">
              <FullTranscript
                sentences={sentences}
                setSentences={setSentences}
                speakers={speakers}
                teacher={teacher}
                setShow={setShow}
                show={show}
              />
            </Tab>
            <Tab eventKey="QuestionsKey" title="Questions">
              <Questions
                sentences={sentences}
                questions={questions}
                setQuestions={setQuestions}
                questioningTime={questioningTime}
                labeledQuestions={labeledQuestions}
                times={times}
                respTime={respTime}
              />
            </Tab>

            <Tab
              eventKey="questionCategoryKey"
              title="Question Category Distribution"
            >
              <QuestionCategoryDistribution
                labeledQuestions={labeledQuestions}
              />
            </Tab>

            <Tab eventKey="barChartKey" title="Talking Distribution">
              <TalkingDistribution series={buildTalkingDistributionSeries()} />
            </Tab>

            <Tab eventKey="timeChartGraphKey" title="Teacher Question Timeline">
              <TeacherQuestionTimeline
                options={getTimeChartProps(sentences).options}
                series={getTimeChartProps(sentences).series}
              />
            </Tab>

            <Tab eventKey="timeLineKey" title="Collapsed Timeline">
              <CollapsedTimeline
                sentences={sentences}
                labelColors={labelColors}
              />
            </Tab>

            <Tab eventKey="visualizations" title="Visualizations">
              <div className="card-deck mb-3 text-center">
                <div className="card mb-4 box-shadow">
                  <div className="card-header">
                    <h2>Word Cloud</h2>
                  </div>
                </div>
              </div>

              <ParentSize>
                {({ width, height }) => (
                  <WordCloud
                    width={width}
                    height={600}
                    showControls="true"
                    transcript={transcript}
                  />
                )}
              </ParentSize>
            </Tab>
          </Tabs>

          <ReportName
            badReportName={badReportName}
            setReportName={setReportName}
            userReportToLoad={userReportToLoad}
          />

          <CsvOptions
            sentences={sentences}
            reportName={reportName}
            setReportName={setReportName}
          />
          <div>
            {successfullUpload ? <h6>File Save Success!!!</h6> : null}
            <PdfOptions
              sentences={sentences}
              transcript={transcript}
              questions={questions}
            />
            <button
              className="btn btn-primary"
              onClick={(e) => reloadPage(e)}
              id="bottom-button2"
            >
              Upload New Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
