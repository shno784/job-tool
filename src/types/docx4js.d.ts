declare module "docx4js" {
  // you can expand these minimal types as you discover more API shape
  export interface DocxDocument {
    getElementsByTagName(tag: string): Array<{
      getElementsByTagName(inner: string): Array<{ textContent: string }>;
    }>;
  }
  /** loads a DOCX buffer and returns a promise of a DocxDocument */
  export function load(buffer: Buffer): Promise<DocxDocument>;
}