/// <reference types="node" />
import { Writable } from "stream";
import { CloudWatchLogs, PutLogEventsCommandInput } from "@aws-sdk/client-cloudwatch-logs";
declare type Next = (error?: Error | null, ...extra: any[]) => void;
declare type RawLogInput = string | Record<string, any>;
export interface InputLogEvent {
    message: string;
    timestamp: number;
}
export interface CWLogsWritableOptions {
    logGroupName: string;
    logStreamName: string;
    cloudWatchLogsOptions: object;
    writeInterval: number | "nextTick";
    retryableDelay: number | "nextTick";
    retryableMax: number;
    maxBatchCount: number;
    maxBatchSize: number;
    ignoreDataAlreadyAcceptedException: boolean;
    retryOnInvalidSequenceToken: boolean;
    onError: (err: Error, logEvents: InputLogEvent[] | null, next: Next) => void;
    filterWrite: (rec: RawLogInput) => boolean;
    objectMode: boolean;
}
/**
 * Writable stream for AWS CloudWatch Logs.
 *
 * @constructor
 * @param {object} options
 * @param {string} options.logGroupName - AWS CloudWatch [LogGroup](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
 * @param {string} options.logStreamName - AWS CloudWatch [LogStream](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
 * @param {object} [options.cloudWatchLogsOptions={}] - Options passed to [AWS.CloudWatchLogs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#constructor-property) service.
 * @param {string|number} [options.writeInterval=nextTick] - Amount of wait time after a Writable#_write call to allow batching of log events. Must be a positive number or "nextTick". If "nextTick", `process.nextTick` is used. If a number, `setTimeout` is used.
 * @param {string|number} [options.retryableDelay=150]
 * @param {number} [options.retryableMax=100] - Maximum number of times an AWS error marked as "retryable" will be retried before the error is instead passed to {@link CWLogsWritable#onError}.
 * @param {number} [options.maxBatchCount=10000] - Maximum number of log events allowed in a single PutLogEvents API call.
 * @param {number} [options.maxBatchSize=1048576] - Maximum number of bytes allowed in a single PutLogEvents API call.
 * @param {boolean} [options.ignoreDataAlreadyAcceptedException=true] - Ignore `DataAlreadyAcceptedException` errors. This will bypass {@link CWLogsWritable#onError}. See [cwlogs-writable/issues/10](https://github.com/amekkawi/cwlogs-writable/issues/10).
 * @param {boolean} [options.retryOnInvalidSequenceToken=true] - Retry on `InvalidSequenceTokenException` errors. This will bypass {@link CWLogsWritable#onError}. See [cwlogs-writable/issues/12](https://github.com/amekkawi/cwlogs-writable/issues/12).
 * @param {function} [options.onError] - Called when an AWS error is encountered. Overwrites {@link CWLogsWritable#onError} method.
 * @param {function} [options.filterWrite] - Filter writes to CWLogsWritable. Overwrites {@link CWLogsWritable#filterWrite} method.
 * @param {boolean} [options.objectMode=true] - Passed to the Writable constructor. See https://nodejs.org/api/stream.html#stream_object_mode.
 * @augments {Writable}
 * @fires CWLogsWritable#putLogEvents
 * @fires CWLogsWritable#createLogGroup
 * @fires CWLogsWritable#createLogStream
 * @fires CWLogsWritable#stringifyError
 * @example
 * ```javascript
 * var CWLogsWritable = require('cwlogs-writable');
 * var stream = new CWLogsWritable({
 *   logGroupName: 'my-log-group',
 *   logStreamName: 'my-stream',
 *   cloudWatchLogsOptions: {
 *     region: 'us-east-1',
 *     accessKeyId: '{AWS-IAM-USER-ACCESS-KEY-ID}',
 *     secretAccessKey: '{AWS-SECRET-ACCESS-KEY}'
 *   }
 * });
 * ```
 */
export declare class CWLogsWritable extends Writable {
    private _onErrorNextCbId;
    sequenceToken: null;
    writeQueued: boolean;
    readonly cloudwatch: CloudWatchLogs;
    /**
     * Logs queued to be sent to AWS CloudWatch Logs. Do not modify directly.
     *
     * @protected
     * @member {Array.<{message:string,timestamp:number}>} CWLogsWritable#queuedLogs
     */
    queuedLogs: InputLogEvent[];
    writeInterval: number | "nextTick";
    ignoreDataAlreadyAcceptedException: boolean;
    retryOnInvalidSequenceToken: boolean;
    retryableMax: number;
    retryableDelay: number | "nextTick";
    maxBatchCount: number;
    maxBatchSize: number;
    static _falseFilterWrite: any;
    private _logGroupName;
    private _logStreamName;
    constructor(options: CWLogsWritableOptions);
    /**
     * AWS CloudWatch [LogGroup](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name.
     * The LogGroup will be created if it doesn't exist.
     * Changes to this property will only take affect for the next PutLogEvents API call.
     *
     * @member {string} CWLogsWritable#logGroupName
     */
    get logGroupName(): string;
    set logGroupName(logGroupName: string);
    /**
     * AWS CloudWatch [LogStream](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name.
     * The LogStream will be created if it doesn't exist.
     * Changes to this property will only take affect for the next PutLogEvents API call.
     *
     * @member {string} CWLogsWritable#logStreamName
     */
    get logStreamName(): string;
    set logStreamName(logStreamName: string);
    /**
     * Validate the options passed to {@link CWLogsWritable}.
     *
     * @protected
     * @param {object} options
     * @throws Error
     */
    validateOptions(options: CWLogsWritableOptions): void;
    /**
     * Get the number of log events queued to be sent to AWS CloudWatch Logs.
     *
     * Does not include events that are actively being sent.
     *
     * @returns {number}
     */
    getQueueSize(): number;
    /**
     * Remove all log events that are still queued.
     *
     * @returns {Array.<{message:string,timestamp:number}>} Log events removed from the queue.
     */
    clearQueue(): InputLogEvent[];
    /**
     * Create a log event object from the log record.
     *
     * @protected
     * @param {object|string} rec
     * @returns {{message: string, timestamp: number}}
     */
    createLogEvent(rec: string | Record<string, any>): InputLogEvent;
    /**
     * Safe stringify a log record. Use by {@link CWLogsWritable#createLogEvent}.
     *
     * @protected
     * @param {*} rec
     * @returns {string}
     */
    safeStringifyLogEvent(rec: Record<string, any>): string;
    /**
     * Called when an AWS error is encountered. Do not call directly.
     *
     * The default behavior of this method is call the `next` argument
     * with the error as the first argument.
     *
     * `logEvents` argument will be either:
     *
     * - An array of log event objects (see {@link CWLogsWritable#createLogEvent})
     *   if error is from PutLogEvents action.
     * - `null` if error is from any action besides PutLogEvents.
     *
     * The `next` argument must be called in one of the following ways:
     *
     * - **`next(err)`** — If the first argument is an instance of `Error`, an 'error'
     *   event will be emitted on the stream, {@link CWLogsWritable#clearQueue} is called,
     *   and {@link CWLogsWritable#filterWrite} is replaced so no further logging
     *   will be processed by the stream. This effectively disables the stream.
     *
     * - **`next()` or `next(logEvents)`** — The stream will recover from the error and
     *   resume sending logs to AWS CloudWatch Logs. The first argument may optionally be
     *   an array of log event objects (i.e. `logEvents` argument) that will be added to
     *   the head of the log events queue.
     *
     * @param {Error} err - AWS error
     * @param {null|Array.<{message:string,timestamp:number}>} logEvents
     * @param {function} next
     * @example
     * ```javascript
     * var CWLogsWritable = require('cwlogs-writable');
     * var stream = new CWLogsWritable({
     *   logGroupName: 'my-log-group',
     *   logStreamName: 'my-stream',
     *   onError: function(err, logEvents, next: Next) {
     *     if (logEvents) {
     *       console.error(
     *         'CWLogsWritable PutLogEvents error',
     *         err,
     *         JSON.stringify(logEvents)
     *       );
     *
     *       // Resume without adding the log events back to the queue.
     *       next();
     *     }
     *     else {
     *       // Use built-in behavior of emitting an error,
     *       // clearing the queue, and ignoring all writes to the stream.
     *       next(err);
     *     }
     *   }
     * }).on('error', function(err) {
     *   // Always listen for 'error' events to catch non-AWS errors as well.
     *   console.error(
     *     'CWLogsWritable error',
     *     err
     *   );
     * });
     * ```
     */
    onError(err: Error, logEvents: InputLogEvent[] | null, next: Next): void;
    /**
     * Filter writes to CWLogsWritable.
     *
     * Default behavior is to return true if `rec` is not null or undefined.
     *
     * @param {string|object} rec - Raw log record passed to Writable#write.
     * @returns {boolean} true to include, and false to exclude.
     */
    filterWrite(rec: RawLogInput): boolean;
    /**
     * Create the AWS.CloudWatchLogs service.
     *
     * @protected
     * @param {object} opts - Passed as first argument to AWS.CloudWatchLogs.
     * @returns {CloudWatchLogs}
     */
    private createService;
    /**
     * Get the next batch of log events to send,
     * based on the the constraints of PutLogEvents.
     *
     * @protected
     * @see http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
     * @returns {Array.<{message: string, timestamp: number}>}
     */
    dequeueNextLogBatch(): InputLogEvent[];
    /**
     * Get the size of the message in bytes.
     *
     * By default this is calculated as the string character length × 4
     * (UTF-8 characters can have up to 4 bytes), which is cheaper
     * than determining the exact byte length.
     *
     * You may override this method to provide your own implementation
     * to correctly measure the number of bytes in the string
     * (i.e. using [Buffer.byteLength()](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_bytelength_string_encoding)).
     *
     * @protected
     * @param {string} message - The "message" prop of a LogEvent.
     * @returns {number} The size of the message in bytes.
     */
    getMessageSize(message: string): number;
    /**
     * Attempt to reduce the specified message so it fits within the
     * 262118 byte limit enforced by PutLogEvents.
     *
     * Only called for messages that are over the byte limit.
     *
     * Use [Buffer.byteLength()](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_bytelength_string_encoding)
     * to accurately measure the message size before returning it.
     *
     * If the string returned is still over the byte limit, this method
     * will _not_ be called again for the log event.
     *
     * @see {CWLogsWritable#event:oversizeLogEvent}
     * @param {string} logEventMessage - Stringified log event.
     * @returns {*|string} - The reduced string, or a non-string (i.e. undefined or null) indicating the message cannot be reduced.
     */
    reduceOversizedMessage(logEventMessage: string): null;
    /**
     * Schedule a call of CWLogsWritable#_sendQueuedLogs to run.
     *
     * @private
     */
    private _scheduleSendLogs;
    /**
     * Internal method called by Writable#_write.
     *
     * @param {object|string} record - Logging record. Can be an object if objectMode options is true.
     * @param {*} _enc - Ignored
     * @param {function} cb - Always called with no arguments.
     * @private
     */
    _write(record: RawLogInput, _enc: string, cb: Next): void;
    /**
     * Send the next batch of log events to AWS CloudWatch Logs.
     *
     * @private
     * @returns {void}
     */
    _sendLogs(): void;
    /**
     * Attempt to continue sending log events to AWS CloudWatch Logs after an error was previously returned.
     *
     * @param {number} _onErrorNextCbId - Internal ID used to prevent multiple calls.
     * @param {Error|Array.<{message:string,timestamp:number}>} [errOrLogEvents] - The log events that failed to send, which will be returned to the beginning of the queue.
     * @private
     */
    _nextAfterError(_onErrorNextCbId: number, errOrLogEvents?: any): void;
    /**
     * Handle a critial error. This effectively disables the stream.
     *
     * @param {Error} err
     * @private
     */
    _handleError(err: Error): void;
    /**
     * Send a PutLogEvents action to AWS.
     *
     * @param {object} apiParams
     * @param {function} cb
     * @private
     */
    _putLogEvents(apiParams: PutLogEventsCommandInput, cb: Next): void;
    /**
     * Describe the LogStream in AWS CloudWatch Logs to get the next sequence token.
     *
     * @param {string} logGroupName
     * @param {string} logStreamName
     * @param {function} cb
     * @private
     */
    _getSequenceToken(logGroupName: string, logStreamName: string, cb: Next): void;
    /**
     * Create both the LogGroup and LogStream in AWS CloudWatch Logs.
     *
     * @param {string} logGroupName
     * @param {string} logStreamName
     * @param {function} cb
     * @private
     */
    _createLogGroupAndStream(logGroupName: string, logStreamName: string, cb: Next): void;
    /**
     * Create the LogGroup in AWS CloudWatch Logs.
     *
     * @param {string} logGroupName
     * @param {function} cb
     * @private
     */
    _createLogGroup(logGroupName: string, cb: Next): void;
    /**
     * Create the LogStream in AWS CloudWatch Logs.
     *
     * @param {string} logGroupName
     * @param {string} logStreamName
     * @param {function} cb
     * @private
     */
    _createLogStream(logGroupName: string, logStreamName: string, cb: Next): void;
    /**
     * Fired on successful PutLogEvent API calls.
     *
     * @event CWLogsWritable#putLogEvents
     * @param {Array.<{message:string,timestamp:number}>} logEvents
     */
    _emitPutLogEvents(logEvents: InputLogEvent[]): void;
    /**
     * Fired on successful CreateLogGroup API call.
     *
     * @event CWLogsWritable#createLogGroup
     */
    _emitCreateLogGroup(): void;
    /**
     * Fired on successful CreateLogStream API call.
     *
     * @event CWLogsWritable#createLogStream
     */
    _emitCreateLogStream(): void;
    /**
     * Fired when an error is thrown while stringifying a log event.
     *
     * @event CWLogsWritable#stringifyError
     * @param {Error} err
     * @param {object|string} rec
     */
    _emitStringifyError(err: Error, rec: RawLogInput): void;
    /**
     * Fired when a log event message is larger than the 262118 byte limit enforced by PutLogEvents.
     *
     * @event CWLogsWritable#oversizeLogEvent
     * @param {string} logEventMessage - Stringified log event.
     */
    _emitOversizeLogEvent(logEventMessage: string): void;
}
export {};
//# sourceMappingURL=index.d.ts.map