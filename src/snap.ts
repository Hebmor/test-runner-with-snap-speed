import { execSync } from 'child_process';

import path from 'path';

export function getChangedGitFiles({
  ignoreFiles,
  mainBranch = 'main',
}: {
  ignoreFiles: string[];
  mainBranch?: string;
}) {
  const command = `git --no-pager diff --minimal --name-only ${mainBranch}`;
  const diffOutput = execSync(command).toString();

  return diffOutput
    .toString()
    .split('\n')
    .filter(Boolean)
    .filter((file) => !ignoreFiles.some((ignoreFile) => file.includes(ignoreFile)));
}

export async function getFileDependencies({
  file,
  folders,
  options,
}: {
  file: string;
  folders: string[];
  options?: Pick<any, 'reaches'>;
}) {
  try {
    const folder = path.basename(path.dirname(file));
    const cruiseOptions: any = {
      reaches: [file, folder],
      doNotFollow: {
        path: 'node_modules',
      },
      ...options,
    };

    const { cruise } = await import('dependency-cruiser');

    const cruiseResult: any = await cruise(folders, cruiseOptions);

    return cruiseResult.output as any;
  } catch (error) {
    console.error(error);
  }
}

export async function getChangedFiles({
  ignoreFiles,
  mainBranch,
  folders,
  options,
  marks,
}: {
  folders: string[];
  ignoreFiles: string[];
  mainBranch?: string;
  options?: Pick<any, 'reaches'>;
  marks: string[];
}) {
  const changed: string[] = getChangedGitFiles({ ignoreFiles, mainBranch });

  console.log('👀 GIT DIFF:', changed);

  const changedStories = new Set();

  const addChangedStories = (name: string) => {
    if (!changedStories.has(name)) {
      changedStories.add(name);
    }
  };

  for (const file of changed) {
    const deps = await getFileDependencies({ file, folders, options });

    if (deps?.modules) {
      for (const module of deps.modules) {
        if (marks.some((mark) => module.source.includes(mark))) {
          addChangedStories(module.source);
        }

        const storiesInDeps = module.dependencies.filter((deps) =>
          marks.some((mark) => deps.module.includes(mark))
        );

        storiesInDeps.forEach((dependent) => {
          addChangedStories(dependent.module);
        });

        const storiesInDependents = module.dependents.filter((dependent) =>
          marks.some((mark) => dependent.includes(mark))
        );

        storiesInDependents.forEach((dependent) => {
          addChangedStories(dependent);
        });
      }
    }
  }

  return changedStories;
}
