import { execSync } from 'child_process';

import path from 'path';

export function getChangedGitFiles({
  paths,
  mainBranch = 'main',
}: {
  paths: string[];
  mainBranch?: string;
}) {
  const commandFetch = `git fetch`;
  execSync(commandFetch);
  const command = `git --no-pager diff --minimal --name-only ${mainBranch}`;
  const diffOutput = execSync(command).toString();
  const excludePaths = paths.filter((path) => path.startsWith('!')).map(item => item.replace('!', ''));
  const includePaths = paths.filter((path) => !path.startsWith('!'));

  return diffOutput
    .toString()
    .split('\n')
    .filter(Boolean)
    .filter((file) => includePaths.some((path) => file.includes(path)))
    .filter((file) => !excludePaths.some((path) => file.includes(path)));
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
  paths,
  mainBranch,
  folders,
  options,
  marks,
}: {
  folders: string[];
  paths: string[];
  mainBranch?: string;
  options?: Pick<any, 'reaches'>;
  marks: string[];
}) {
  const changed: string[] = getChangedGitFiles({ paths, mainBranch });

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
