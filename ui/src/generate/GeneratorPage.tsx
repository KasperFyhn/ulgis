import '../common.scss';
import { DefaultGenerationService } from './GenerationService';
import React, { useEffect, useState } from 'react';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
  UiLevel,
} from './models';

import { OptionsPanel } from './OptionsPanel';
import { GenerationPane } from './GenerationPane';

const service = new DefaultGenerationService();

interface GeneratorPageProps {
  uiLevel: UiLevel;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  uiLevel,
}: GeneratorPageProps) => {
  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );

  useEffect(() => {
    service.getGenerationOptionsMetadata(uiLevel).then((metadata) => {
      setOptionsMetadata(() => metadata);
      setOptions((prevState) => initGenerationOptions(metadata, prevState));
    });
  }, [uiLevel]);

  if (optionsMetadata === undefined) {
    return <div>Loading...</div>;
  }

  const optionMetadataList = Object.entries(optionsMetadata);

  const topPanelMetadata = optionsMetadata.taxonomies;
  if (optionsMetadata.taxonomies) {
    optionMetadataList.splice(
      optionMetadataList.findIndex((entry) => entry[0] === 'taxonomies'),
      1,
    );
  }

  const halfLength = Math.floor(optionMetadataList.length / 2);
  const leftPanelMetadata = optionMetadataList.slice(0, halfLength);
  const rightPanelMetadata = optionMetadataList.slice(halfLength);

  return (
    <div className={'flex-container--vert'}>
      {topPanelMetadata && (
        <div className={'content-pane flex-container__box padded'}>
          <OptionsPanel
            metadataEntry={['taxonomies', topPanelMetadata]}
            options={options}
            setOptions={setOptions}
          />
        </div>
      )}
      <div className={'flex-container--horiz'}>
        <div className={'content-pane flex-container__box--equal-size padded'}>
          {leftPanelMetadata
            .map((metadataEntry) => (
              <OptionsPanel
                key={metadataEntry[0]}
                metadataEntry={metadataEntry}
                options={options}
                setOptions={setOptions}
              />
            ))
            .filter((obj) => obj !== undefined)}
        </div>
        <GenerationPane generationOptions={options} service={service} />
        <div className={'content-pane flex-container__box--equal-size padded'}>
          {rightPanelMetadata.map((metadataEntry) => (
            <OptionsPanel
              key={metadataEntry[0]}
              metadataEntry={metadataEntry}
              options={options}
              setOptions={setOptions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
