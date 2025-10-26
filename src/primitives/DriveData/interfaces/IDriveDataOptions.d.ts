/**
 * Options for creating a DriveData instance
 */
export interface IDriveDataOptions {
    /**
     * The data type. Must be one of the valid types or a custom type with 'other:' prefix.
     * Valid standard types: 'text', 'json', 'binary', 'document', 'image', 'video'
     * Custom types format: 'other:customname' (e.g., 'other:pdf', 'other:xml')
     * @default 'text'
     */
    type?: string;

    /**
     * The data content as a string
     * @default ''
     */
    content?: string;
}
