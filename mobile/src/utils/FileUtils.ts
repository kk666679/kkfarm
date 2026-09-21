import * as FileSystem from 'react-native-fs';
import { Platform } from 'react-native';

export const FileUtils = {
  async saveToFile(filename: string, content: string): Promise<string> {
    const dir =
      Platform.select({
        ios: FileSystem.DocumentDirectoryPath,
        android: FileSystem.DocumentDirectoryPath,
      }) || FileSystem.DocumentDirectoryPath;

    const path = `${dir}/${filename}`;
    await FileSystem.writeFile(path, content, 'utf8');
    return path;
  },

  async readFile(path: string): Promise<string> {
    return FileSystem.readFile(path, 'utf8');
  },

  async deleteFile(path: string): Promise<void> {
    const exists = await FileSystem.exists(path);
    if (exists) {
      await FileSystem.unlink(path);
    }
  },

  async getDocumentsDir(): Promise<string> {
    return FileSystem.DocumentDirectoryPath;
  },
};

export default FileUtils;
