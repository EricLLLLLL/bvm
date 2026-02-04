import { Composition } from 'remotion';
import { BvmDemo } from './scenes/bvm-demo';
import { BvmInstallMethods } from './scenes/bvm-install-methods';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="BvmDemo"
        component={BvmDemo}
        durationInFrames={18 * 30}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="BvmInstallMethods"
        component={BvmInstallMethods}
        durationInFrames={24 * 30}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
    </>
  );
};
