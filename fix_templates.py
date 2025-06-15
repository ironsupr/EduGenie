#!/usr/bin/env python3
"""
Fix all TemplateResponse calls in student_routes.py to use the new Starlette format
"""

import re

def fix_template_responses():    # Read the file
    with open('frontend/web_app/routes/student_routes.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match TemplateResponse with old format
    old_pattern = r'templates\.TemplateResponse\("([^"]+)",\s*\{\s*"request":\s*request,\s*([^}]*)\}\)'
    
    def replacement(match):
        template_name = match.group(1)
        context_params = match.group(2).strip()
        
        if context_params:
            # Remove any trailing comma
            context_params = context_params.rstrip(',').strip()
            return f'templates.TemplateResponse(request, "{template_name}", {{{context_params}}})'
        else:
            return f'templates.TemplateResponse(request, "{template_name}")'
    
    # Apply the replacement
    new_content = re.sub(old_pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
    
    # Handle the case where request is the only parameter
    simple_pattern = r'templates\.TemplateResponse\("([^"]+)",\s*\{\s*"request":\s*request\s*\}\)'
    new_content = re.sub(simple_pattern, r'templates.TemplateResponse(request, "\1")', new_content)
      # Write back the file
    with open('frontend/web_app/routes/student_routes.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Fixed all TemplateResponse calls")

if __name__ == "__main__":
    fix_template_responses()
