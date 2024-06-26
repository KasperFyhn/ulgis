import '../common.scss';
import './chart.css';
import React from 'react';
import RadarChart, { ChartProps } from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css';
import { evaluate } from './EvaluationService';

export const EvaluationPage: React.FC = () => {
  const [inputText, setInputText] = React.useState('');

  const [evaluationData, setEvaluationData] = React.useState({
    communicationAndCollaboration: 0,
    digitalContentCreation: 0,
    informationAndDataLiteracy: 0,
    problemSolving: 0,
    safety: 0,
  });

  const radarChartProps: ChartProps = {
    captions: {
      communicationAndCollaboration: 'Communication & Collaboration',
      digitalContentCreation: 'Digital Content Creation',
      informationAndDataLiteracy: 'Information &  Data Literacy',
      problemSolving: 'Problem Solving',
      safety: 'Safety',
    },
    data: [
      {
        data: evaluationData,
        meta: {
          color: 'deepskyblue',
        },
      },
    ],
    size: 450,
    options: {
      captionMargin: 40,
      scales: 5,
    },
  };

  return (
    <div className={'flex-container--horiz'}>
      <div
        className={
          'content-pane flex-container__box--big flex-container--vert padded'
        }
      >
        <h1>Input</h1>
        <textarea
          className={'height-400px'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          onClick={() =>
            evaluate(inputText)
              .then((result) => setEvaluationData(result))
              .catch(() => alert('Something went wrong. Just try again. :-)'))
          }
        >
          Evaluate
        </button>
      </div>
      <div className={'content-pane flex-container__box--small padded'}>
        <h1>Evaluation</h1>
        <RadarChart {...radarChartProps} />
      </div>
    </div>
  );
};
