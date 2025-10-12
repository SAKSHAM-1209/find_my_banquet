from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
import json
import logging
from .models import Banquet, BanquetImage, ScheduleCall, ContactMessage
from .forms import SignUpForm, LoginForm, BanquetForm, ScheduleCallForm, ContactMessageForm
from .constants import KANPUR_AREAS  # ✅ Predefined areas

# Setup logging
logger = logging.getLogger(__name__)

# ===== LANDING PAGE =====
def landing(request):
    banquets = Banquet.objects.all()
    area = request.GET.get('area')  
    guests = request.GET.get('guests')

    if area:
        banquets = banquets.filter(location__iexact=area)
    if guests:
        try:
            guests_int = int(guests)
            banquets = banquets.filter(capacity__gte=guests_int)
        except ValueError:
            pass

    context = {
        'banquets': banquets,
        'KANPUR_AREAS': KANPUR_AREAS,
        'request': request  # ✅ Add request for template GET values
    }
    return render(request, 'landing.html', context)



# ===== ABOUT PAGE =====
def about(request):
    return render(request, 'about.html')


# ===== BANQUET PAGE =====
def banquet(request):
    banquets = Banquet.objects.all()
    return render(request, 'banquet.html', {'banquets': banquets})


# ===== SIGNUP (AJAX Compatible) =====
def signup_view(request):
    if request.method == 'POST':
        try:
            form = SignUpForm(request.POST)
            if form.is_valid():
                user = form.save()
                login(request, user)
                
                # Handle venue/banquet creation if provided
                venue_name = request.POST.get('venue_name')
                venue_address = request.POST.get('venue_address')
                venue_capacity = request.POST.get('venue_capacity')
                venue_price = request.POST.get('venue_price')

                if venue_name and venue_address and venue_capacity and venue_price:
                    try:
                        Banquet.objects.create(
                            owner=user,
                            owner_name=user.get_full_name() or user.username,
                            banquet_name=venue_name,
                            email=user.email,
                            phone="",
                            capacity=int(venue_capacity),
                            location=venue_address,
                            google_link="",
                            services=""
                        )
                    except Exception as e:
                        logger.error(f"Banquet creation error: {e}")

                # AJAX Response
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': '✅ Account created successfully!',
                        'redirect': '/'
                    })
                
                messages.success(request, '✅ Account created successfully!')
                return redirect('landing')
            else:
                # AJAX Response for errors
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors,
                        'message': 'Please correct the errors below.'
                    })
                
                messages.error(request, 'Please correct the errors below.')
        except Exception as e:
            logger.error(f"Signup error: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred. Please try again.'
                })
            messages.error(request, 'An error occurred. Please try again.')
    else:
        form = SignUpForm()

    return render(request, 'signup.html', {'form': form})




# ===== LOGIN (AJAX Compatible) =====
def login_view(request):
    if request.method == 'POST':
        try:
            form = LoginForm(request=request, data=request.POST)
            if form.is_valid():
                user = form.get_user()
                login(request, user)
                
                # AJAX Response
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': '✅ Logged in successfully!',
                        'redirect': '/'
                    })
                
                messages.success(request, '✅ Logged in successfully!')
                return redirect('landing')
            else:
                # AJAX Response for errors
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors,
                        'message': '⚠ Invalid username or password.'
                    })
                
                messages.error(request, '⚠ Invalid username or password.')
        except Exception as e:
            logger.error(f"Login error: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred. Please try again.'
                })
            messages.error(request, 'An error occurred. Please try again.')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})


# ===== LOGOUT =====
def logout_view(request):
    logout(request)
    messages.info(request, 'Logged out successfully.')
    return redirect('landing')


# ===== BANQUET REGISTRATION (AJAX Compatible) =====
@login_required(login_url='login')
def register_banquet(request):
    if request.method == 'POST':
        try:
            form = BanquetForm(request.POST)
            files = request.FILES.getlist('image')  # multiple images handle

            if form.is_valid():
                banquet = form.save(commit=False)
                banquet.owner = request.user
                banquet.owner_name = request.user.get_full_name() or request.user.username
                banquet.save()

                # Handle multiple images
                for f in files:
                    BanquetImage.objects.create(banquet=banquet, image=f)

                # AJAX Response
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': '✅ Banquet registered successfully with images!',
                        'redirect': '/'
                    })
                
                messages.success(request, '✅ Banquet registered successfully with images!')
                return redirect('landing')
            else:
                # AJAX Response for errors
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors,
                        'message': 'Please correct the errors below.'
                    })
                
                messages.error(request, 'Please correct the errors below.')
        except Exception as e:
            logger.error(f"Banquet registration error: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred. Please try again.'
                })
            messages.error(request, 'An error occurred. Please try again.')
    else:
        form = BanquetForm()

    return render(request, 'register.html', {'form': form})





# ===== SCHEDULE CALL (AJAX Compatible) =====
def schedule_call(request):
    if request.method == 'POST':
        try:
            form = ScheduleCallForm(request.POST)
            if form.is_valid():
                call = form.save()
                
                # AJAX Response
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': f"✅ Your call has been scheduled for {call.date} at {call.time_slot}."
                    })
                
                messages.success(request, f"✅ Your call has been scheduled for {call.date} at {call.time_slot}.")
                return redirect('landing')
            else:
                # AJAX Response for errors
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors,
                        'message': 'Please correct the errors below.'
                    })
                
                messages.error(request, 'Please correct the errors below.')
        except Exception as e:
            logger.error(f"Schedule call error: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred. Please try again.'
                })
            messages.error(request, 'An error occurred. Please try again.')
    else:
        form = ScheduleCallForm()
    return render(request, 'schedule-call.html', {'form': form})


# ===== CONTACT US (AJAX Compatible) =====
def contact_us(request):
    if request.method == 'POST':
        try:
            form = ContactMessageForm(request.POST)
            if form.is_valid():
                form.save()
                
                # AJAX Response
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': '✅ Your message has been sent successfully!'
                    })
                
                messages.success(request, '✅ Your message has been sent successfully!')
                return redirect('landing')
            else:
                # AJAX Response for errors
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors,
                        'message': 'Please correct the errors below.'
                    })
                
                messages.error(request, 'Please correct the errors below.')
        except Exception as e:
            logger.error(f"Contact form error: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred. Please try again.'
                })
            messages.error(request, 'An error occurred. Please try again.')
    else:
        form = ContactMessageForm()
    return render(request, 'contact.html', {'form': form})
