import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";

interface GroupConfigItem<Keys, T> {
  key: Keys;
  test: (value: T) => boolean;
}

interface RenameMapperRule {
  group?: string;
  test: (path: string) => boolean;
  mapper: (path: string) => string;
}

export const group = <Keys extends string, T>(list: T[], config: GroupConfigItem<Keys, T>[]): Record<Keys, T[]> => {
  const ret = {} as Record<Keys, T[]>;
  for (const configItem of config) {
    ret[configItem.key] = [];
  }

  for (const item of list) {
    for (const configItem of config) {
      if (configItem.test(item)) {
        ret[configItem.key].push(item);
        break;
      }
    }
  }

  return ret;
};

export const forceWriteFile = async (filepath: string, buf: string | Buffer) => {
  const dir = path.dirname(filepath);
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(filepath, buf);
};

export const buildRenameMapper = (rules: RenameMapperRule[]) => {
  /**
   * if group is undefined, will try to match all rules
   *
   * if group is defined, will try to match rules that has same group
   */
  const findAnyRule = (path: string, group?: string) => {
    for (const rule of rules) {
      if (rule.test(path) && (!group || rule.group === group)) {
        return rule;
      }
    }
  };

  const map = (path: string, group?: string) => {
    const rule = findAnyRule(path, group);
    return rule?.mapper(path) ?? path;
  };
  const findAnyRuleOrThrow = (path: string, group?: string) => {
    const rule = findAnyRule(path, group);
    if (!rule) {
      throw new Error(`cannot find rule for path "${path}", group "${group}"`);
    }
    return rule;
  };

  return {
    findAnyRule,
    findAnyRuleOrThrow,
    map,
  };
};
