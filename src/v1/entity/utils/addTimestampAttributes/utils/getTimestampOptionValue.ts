import {
  TIMESTAMPS_DEFAULTS_OPTIONS,
  TimestampsDefaultOptions,
} from '../timestampDefaultOptions'
import type { TimestampsOptions } from '../timestampOptions'
import { isTimestampObjectOptions } from './isTimestampObjectOptions'
import { isTimestampsObjectOptions } from './isTimestampsObjectOptions'

export type TimestampOptionValue<
  TIMESTAMP_OPTIONS extends TimestampsOptions,
  TIMESTAMP_KEY extends 'created' | 'modified',
  OPTION_KEY extends 'name' | 'savedAs' | 'hidden'
> = TIMESTAMP_OPTIONS extends {
  [KEY in TIMESTAMP_KEY]: { [KEY in OPTION_KEY]: unknown }
}
  ? TIMESTAMP_OPTIONS[TIMESTAMP_KEY][OPTION_KEY]
  : TimestampsDefaultOptions[TIMESTAMP_KEY][OPTION_KEY]

export const getTimestampOptionValue = <
  TIMESTAMP_OPTIONS extends TimestampsOptions,
  TIMESTAMP_KEY extends 'created' | 'modified',
  OPTION_KEY extends 'name' | 'savedAs' | 'hidden'
>(
  timestampsOptions: TIMESTAMP_OPTIONS,
  timestampKey: TIMESTAMP_KEY,
  optionKey: OPTION_KEY,
): TimestampOptionValue<TIMESTAMP_OPTIONS, TIMESTAMP_KEY, OPTION_KEY> => {
  const defaultOptions = TIMESTAMPS_DEFAULTS_OPTIONS[timestampKey][
    optionKey
  ] as TimestampOptionValue<TIMESTAMP_OPTIONS, TIMESTAMP_KEY, OPTION_KEY>

  if (isTimestampsObjectOptions(timestampsOptions)) {
    const timestampOptions = timestampsOptions[timestampKey]

    return isTimestampObjectOptions(timestampOptions)
      ? (timestampOptions[optionKey] as TimestampOptionValue<
          TIMESTAMP_OPTIONS,
          TIMESTAMP_KEY,
          OPTION_KEY
        >) ?? defaultOptions
      : defaultOptions
  }

  return defaultOptions
}
