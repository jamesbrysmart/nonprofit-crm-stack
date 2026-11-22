import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { getReportingCurrencyCode } from 'src/reporting-currency/reporting-currency';

type GiftRelation = 'donor' | 'company' | 'appeal';

const NOTICE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
};

const countGiftsNeedingReportingValue = async (
  relation: GiftRelation,
  recordId: string,
) => {
  const result = await new CoreApiClient().query({
    gifts: {
      __args: {
        filter: {
          [`${relation}Id`]: { eq: recordId },
          reportingAmountStatus: { eq: 'MISSING' },
        },
      },
      totalCount: true,
    },
  });

  return (result as { gifts?: { totalCount?: number } })?.gifts?.totalCount ?? 0;
};

// Says when gifts are left out of this record's totals for want of a value in
// the reporting currency, and links to them so they can be resolved.
export const ReportingExclusionNotice = ({
  relation,
  recordId,
}: {
  relation: GiftRelation;
  recordId: string;
}) => {
  const reportingCurrencyCode = getReportingCurrencyCode();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!reportingCurrencyCode) {
      return;
    }

    let isCurrent = true;

    void countGiftsNeedingReportingValue(relation, recordId)
      .then((nextCount) => {
        if (isCurrent) {
          setCount(nextCount);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [relation, recordId, reportingCurrencyCode]);

  if (!reportingCurrencyCode || count === 0) {
    return null;
  }

  return (
    <div style={NOTICE_STYLE}>
      <Text render={<span />} size="sm" color="secondary">
        {`${count} gift${count === 1 ? '' : 's'} without a ${reportingCurrencyCode} value ${
          count === 1 ? 'is' : 'are'
        } not included in these totals.`}
      </Text>
      <Button
        variant="link"
        size="sm"
        onClick={() => {
          void navigate(
            AppPath.RecordIndexPage,
            { objectNamePlural: 'gifts' },
            {
              'filter[reportingAmountStatus][IS]': ['MISSING'],
              [`filter[${relation}][IS]`]: [recordId],
            },
          );
        }}
      >
        Review
      </Button>
    </div>
  );
};
