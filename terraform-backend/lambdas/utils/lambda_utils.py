"""Lambda utils."""
import json
from decimal import Decimal


class LambdaJSONEncoder(json.JSONEncoder):
    """DynamoDB encoder to handle decimal cases."""

    def default(self, o):
        """Convert to float."""
        if isinstance(o, Decimal):
            return float(o)
        return super(LambdaJSONEncoder, self).default(o)


def get_return_block_with_cors(body, needs_encoding=True):
    """Get return block with cors."""
    # TODO just auto-detect needs_encoding
    if needs_encoding:
        body = json.dumps(body, cls=LambdaJSONEncoder)
    return {
        "statusCode": 200,
        "body": body,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET",
            "Content-Type": "application/json",
        },
    }