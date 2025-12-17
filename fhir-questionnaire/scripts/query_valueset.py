#!/usr/bin/env python3
"""
Query FHIR servers for ValueSets and CodeSystems.

This script queries FHIR servers to retrieve ValueSets and CodeSystems that can be
used in FHIR Questionnaire answerValueSet references.

Usage:
    python query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender"
    python query_valueset.py --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender
    python query_valueset.py --expand --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional
from urllib import request, parse, error


def search_valuesets(server_url: str, search_term: str, limit: int = 10) -> List[Dict]:
    """
    Search for ValueSets on a FHIR server.

    Args:
        server_url: Base URL of the FHIR server
        search_term: Search term for ValueSet name or title
        limit: Maximum number of results

    Returns:
        List of ValueSet resources
    """
    params = {
        "title:contains": search_term,
        "_count": str(limit),
        "_summary": "true"
    }

    url = f"{server_url}/ValueSet?{parse.urlencode(params)}"

    try:
        req = request.Request(url)
        req.add_header("Accept", "application/fhir+json")

        with request.urlopen(req, timeout=10) as response:
            bundle = json.loads(response.read().decode())

        if bundle.get("resourceType") != "Bundle":
            print(f"Error: Expected Bundle, got {bundle.get('resourceType')}", file=sys.stderr)
            return []

        return bundle.get("entry", [])

    except error.URLError as e:
        print(f"Error accessing FHIR server: {e}", file=sys.stderr)
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing response: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return []


def get_valueset(server_url: str, valueset_id: str, expand: bool = False) -> Optional[Dict]:
    """
    Retrieve a specific ValueSet from a FHIR server.

    Args:
        server_url: Base URL of the FHIR server
        valueset_id: ValueSet URL or ID
        expand: Whether to expand the ValueSet to show all codes

    Returns:
        ValueSet resource or None if not found
    """
    # If valueset_id is a full URL, use it directly with $expand
    if valueset_id.startswith("http"):
        if expand:
            url = f"{server_url}/ValueSet/$expand?url={parse.quote(valueset_id)}"
        else:
            # Search for the ValueSet by URL
            url = f"{server_url}/ValueSet?url={parse.quote(valueset_id)}"
    else:
        # Treat as a resource ID
        if expand:
            url = f"{server_url}/ValueSet/{valueset_id}/$expand"
        else:
            url = f"{server_url}/ValueSet/{valueset_id}"

    try:
        req = request.Request(url)
        req.add_header("Accept", "application/fhir+json")

        with request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        # If we got a Bundle from the search, extract the first ValueSet
        if data.get("resourceType") == "Bundle":
            entries = data.get("entry", [])
            if entries:
                return entries[0].get("resource")
            return None

        return data

    except error.HTTPError as e:
        if e.code == 404:
            print(f"Error: ValueSet not found: {valueset_id}", file=sys.stderr)
        else:
            print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return None
    except error.URLError as e:
        print(f"Error accessing FHIR server: {e}", file=sys.stderr)
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing response: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return None


def format_valueset_summary(entries: List[Dict]) -> str:
    """Format ValueSet search results as a summary table."""
    if not entries:
        return "No ValueSets found."

    output = []
    output.append(f"{'Title':<40} {'ID/URL':<60}")
    output.append("-" * 100)

    for entry in entries:
        resource = entry.get("resource", {})
        title = resource.get("title", resource.get("name", "N/A"))[:37] + "..." if len(resource.get("title", resource.get("name", "N/A"))) > 40 else resource.get("title", resource.get("name", "N/A"))
        url = resource.get("url", resource.get("id", "N/A"))[:57] + "..." if len(resource.get("url", resource.get("id", "N/A"))) > 60 else resource.get("url", resource.get("id", "N/A"))
        output.append(f"{title:<40} {url:<60}")

    return "\n".join(output)


def format_valueset_expansion(valueset: Dict) -> str:
    """Format an expanded ValueSet showing all codes."""
    if "expansion" not in valueset:
        return json.dumps(valueset, indent=2)

    output = []
    output.append(f"ValueSet: {valueset.get('title', valueset.get('name', 'N/A'))}")
    output.append(f"URL: {valueset.get('url', 'N/A')}")
    output.append(f"Version: {valueset.get('version', 'N/A')}")
    output.append("\nCodes:")
    output.append(f"{'System':<40} {'Code':<20} {'Display':<50}")
    output.append("-" * 110)

    expansion = valueset.get("expansion", {})
    contains = expansion.get("contains", [])

    for item in contains:
        system = item.get("system", "")[:37] + "..." if len(item.get("system", "")) > 40 else item.get("system", "")
        code = item.get("code", "")[:17] + "..." if len(item.get("code", "")) > 20 else item.get("code", "")
        display = item.get("display", "")[:47] + "..." if len(item.get("display", "")) > 50 else item.get("display", "")
        output.append(f"{system:<40} {code:<20} {display:<50}")

    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Query FHIR servers for ValueSets and CodeSystems",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search for ValueSets
  python query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender"

  # Get a specific ValueSet
  python query_valueset.py --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender

  # Expand a ValueSet to see all codes
  python query_valueset.py --expand --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender

Common FHIR servers:
  - HAPI FHIR Test Server: https://hapi.fhir.org/baseR4
  - Ontoserver (Australian): https://r4.ontoserver.csiro.au/fhir
        """
    )

    parser.add_argument("--server", required=True, help="FHIR server base URL")
    parser.add_argument("--search", help="Search term for ValueSets")
    parser.add_argument("--id", help="ValueSet URL or ID to retrieve")
    parser.add_argument("--expand", action="store_true", help="Expand ValueSet to show all codes")
    parser.add_argument("--format", choices=["json", "table"], default="table",
                       help="Output format (default: table)")
    parser.add_argument("--limit", type=int, default=10, help="Maximum search results (default: 10)")

    args = parser.parse_args()

    if not args.search and not args.id:
        parser.error("Either --search or --id must be specified")

    if args.search and args.id:
        parser.error("Cannot specify both --search and --id")

    # Search for ValueSets
    if args.search:
        results = search_valuesets(args.server, args.search, args.limit)
        if not results:
            print("No results found or an error occurred.", file=sys.stderr)
            sys.exit(1)

        if args.format == "json":
            print(json.dumps(results, indent=2))
        else:
            print(format_valueset_summary(results))

    # Get specific ValueSet
    elif args.id:
        valueset = get_valueset(args.server, args.id, args.expand)
        if not valueset:
            sys.exit(1)

        if args.format == "json":
            print(json.dumps(valueset, indent=2))
        else:
            if args.expand:
                print(format_valueset_expansion(valueset))
            else:
                print(json.dumps(valueset, indent=2))


if __name__ == "__main__":
    main()
